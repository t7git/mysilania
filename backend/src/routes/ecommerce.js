const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   POST api/ecommerce/create-listing
// @desc    Create a listing on an eCommerce platform
// @access  Private
router.post('/create-listing', auth, async (req, res) => {
  try {
    const { item_id, platform, listing_data } = req.body;
    
    if (!item_id || !platform || !listing_data) {
      return res.status(400).json({ msg: 'Item ID, platform, and listing data are required' });
    }
    
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    const item = itemCheck.rows[0];
    
    // Prepare listing data based on platform
    let platformApiUrl;
    let platformData;
    
    switch (platform.toLowerCase()) {
      case 'ebay':
        platformApiUrl = process.env.EBAY_API_URL || 'https://api.ebay.com/sell/inventory/v1/inventory_item';
        platformData = {
          sku: listing_data.sku || `mysilania-${item.id}`,
          product: {
            title: listing_data.title || item.name,
            description: listing_data.description || item.description,
            aspects: {
              Brand: ['mysilania'],
              MPN: [item.part_number || `mysilania-${item.id}`],
              'Vehicle Make': item.vehicle_make ? [item.vehicle_make] : undefined,
              'Vehicle Model': item.vehicle_model ? [item.vehicle_model] : undefined
            },
            imageUrls: [
              item.thumbnail_url
            ]
          },
          availability: {
            shipToLocationAvailability: {
              quantity: listing_data.quantity || 1
            }
          },
          condition: listing_data.condition || 'USED_EXCELLENT',
          packageWeightAndSize: {
            weight: {
              value: item.weight,
              unit: 'POUND'
            },
            dimensions: {
              length: item.depth,
              width: item.width,
              height: item.height,
              unit: 'INCH'
            }
          },
          price: {
            value: listing_data.price || item.price,
            currency: 'USD'
          }
        };
        break;
        
      case 'shopify':
        platformApiUrl = process.env.SHOPIFY_API_URL || 'https://your-store.myshopify.com/admin/api/2023-01/products.json';
        platformData = {
          product: {
            title: listing_data.title || item.name,
            body_html: listing_data.description || item.description,
            vendor: 'mysilania',
            product_type: listing_data.category || 'Auto Parts',
            tags: [
              'mysilania',
              item.vehicle_make,
              item.vehicle_model,
              item.part_number
            ].filter(Boolean),
            variants: [
              {
                price: listing_data.price || item.price,
                sku: listing_data.sku || `mysilania-${item.id}`,
                inventory_quantity: listing_data.quantity || 1,
                weight: item.weight,
                weight_unit: 'lb',
                requires_shipping: true
              }
            ],
            images: [
              {
                src: item.thumbnail_url
              }
            ]
          }
        };
        break;
        
      default:
        return res.status(400).json({ msg: 'Unsupported platform' });
    }
    
    // Mock API call to eCommerce platform (in production, use actual API)
    // const platformResponse = await axios.post(platformApiUrl, platformData, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env[`${platform.toUpperCase()}_API_KEY`]}`,
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    // For demo purposes, simulate a successful response
    const platformResponse = {
      data: {
        id: `${platform.toLowerCase()}-${Date.now()}`,
        url: `https://${platform.toLowerCase()}.com/listing/${Date.now()}`
      }
    };
    
    // Store listing in database
    const listingResult = await db.query(
      'INSERT INTO ecommerce_listings (item_id, platform, platform_listing_id, listing_url, listing_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        item_id,
        platform.toLowerCase(),
        platformResponse.data.id,
        platformResponse.data.url,
        'active'
      ]
    );
    
    // Log the action
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'CREATE_LISTING', 'ecommerce_listings', listingResult.rows[0].id, JSON.stringify({ platform, listing_data })]
    );
    
    res.json({
      msg: `Listing created on ${platform}`,
      listing: listingResult.rows[0]
    });
  } catch (err) {
    console.error('eCommerce listing creation error:', err.message);
    res.status(500).json({ msg: 'Failed to create listing', error: err.message });
  }
});

// @route   GET api/ecommerce/listings/:item_id
// @desc    Get all listings for an item
// @access  Private
router.get('/listings/:item_id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.params.item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Get listings
    const listings = await db.query(
      'SELECT * FROM ecommerce_listings WHERE item_id = $1 ORDER BY created_at DESC',
      [req.params.item_id]
    );
    
    res.json(listings.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/ecommerce/listings/:id
// @desc    Update a listing status
// @access  Private
router.put('/listings/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ msg: 'Status is required' });
    }
    
    const db = req.app.locals.db;
    
    // Check if listing exists
    const listingCheck = await db.query('SELECT * FROM ecommerce_listings WHERE id = $1', [req.params.id]);
    
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Listing not found' });
    }
    
    // Update listing status
    const result = await db.query(
      'UPDATE ecommerce_listings SET listing_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    
    // Log the action
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'UPDATE_LISTING', 'ecommerce_listings', req.params.id, JSON.stringify({ status })]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/ecommerce/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete('/listings/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if listing exists
    const listingCheck = await db.query('SELECT * FROM ecommerce_listings WHERE id = $1', [req.params.id]);
    
    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Listing not found' });
    }
    
    // In a real application, you would also call the platform's API to delete the listing
    // const platformResponse = await axios.delete(`${platformApiUrl}/${listingCheck.rows[0].platform_listing_id}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env[`${listingCheck.rows[0].platform.toUpperCase()}_API_KEY`]}`,
    //   }
    // });
    
    // Delete listing from database
    await db.query('DELETE FROM ecommerce_listings WHERE id = $1', [req.params.id]);
    
    // Log the action
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'DELETE_LISTING', 'ecommerce_listings', req.params.id, JSON.stringify(listingCheck.rows[0])]
    );
    
    res.json({ msg: 'Listing removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/ecommerce/batch-create
// @desc    Create multiple listings in batch
// @access  Private
router.post('/batch-create', auth, async (req, res) => {
  try {
    const { items, platform, listing_template } = req.body;
    
    if (!items || !items.length || !platform || !listing_template) {
      return res.status(400).json({ msg: 'Items array, platform, and listing template are required' });
    }
    
    const db = req.app.locals.db;
    
    // Process each item
    const results = [];
    const errors = [];
    
    for (const item_id of items) {
      try {
        // Check if item exists
        const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [item_id]);
        
        if (itemCheck.rows.length === 0) {
          errors.push({ item_id, error: 'Item not found' });
          continue;
        }
        
        const item = itemCheck.rows[0];
        
        // Create listing data by merging template with item data
        const listing_data = {
          ...listing_template,
          title: listing_template.title || item.name,
          description: listing_template.description || item.description,
          price: listing_template.price || item.price,
          sku: listing_template.sku || `mysilania-${item.id}`
        };
        
        // For demo purposes, simulate a successful response
        const platformResponse = {
          data: {
            id: `${platform.toLowerCase()}-${Date.now()}-${item.id}`,
            url: `https://${platform.toLowerCase()}.com/listing/${Date.now()}-${item.id}`
          }
        };
        
        // Store listing in database
        const listingResult = await db.query(
          'INSERT INTO ecommerce_listings (item_id, platform, platform_listing_id, listing_url, listing_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [
            item_id,
            platform.toLowerCase(),
            platformResponse.data.id,
            platformResponse.data.url,
            'active'
          ]
        );
        
        // Log the action
        await db.query(
          'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
          [req.user.id, 'BATCH_CREATE_LISTING', 'ecommerce_listings', listingResult.rows[0].id, JSON.stringify({ platform, listing_data })]
        );
        
        results.push(listingResult.rows[0]);
      } catch (err) {
        errors.push({ item_id, error: err.message });
      }
    }
    
    res.json({
      msg: `Batch created ${results.length} listings on ${platform}`,
      successful: results.length,
      failed: errors.length,
      listings: results,
      errors
    });
  } catch (err) {
    console.error('Batch listing creation error:', err.message);
    res.status(500).json({ msg: 'Failed to create batch listings', error: err.message });
  }
});

module.exports = router;
