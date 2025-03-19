const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// @route   GET api/items
// @desc    Get all items with optional filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      name, 
      part_number, 
      vehicle_make, 
      vehicle_model, 
      item_type,
      min_price,
      max_price,
      bay,
      sort_by,
      sort_order,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build query
    let query = 'SELECT * FROM items WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;
    
    // Add filters if provided
    if (name) {
      query += ` AND name ILIKE $${paramIndex}`;
      queryParams.push(`%${name}%`);
      paramIndex++;
    }
    
    if (part_number) {
      query += ` AND part_number ILIKE $${paramIndex}`;
      queryParams.push(`%${part_number}%`);
      paramIndex++;
    }
    
    if (vehicle_make) {
      query += ` AND vehicle_make ILIKE $${paramIndex}`;
      queryParams.push(`%${vehicle_make}%`);
      paramIndex++;
    }
    
    if (vehicle_model) {
      query += ` AND vehicle_model ILIKE $${paramIndex}`;
      queryParams.push(`%${vehicle_model}%`);
      paramIndex++;
    }
    
    if (item_type) {
      query += ` AND item_type = $${paramIndex}`;
      queryParams.push(item_type);
      paramIndex++;
    }
    
    if (bay) {
      query += ` AND bay = $${paramIndex}`;
      queryParams.push(bay);
      paramIndex++;
    }
    
    if (min_price) {
      query += ` AND price >= $${paramIndex}`;
      queryParams.push(min_price);
      paramIndex++;
    }
    
    if (max_price) {
      query += ` AND price <= $${paramIndex}`;
      queryParams.push(max_price);
      paramIndex++;
    }
    
    // Add sorting
    if (sort_by) {
      const validSortColumns = ['name', 'part_number', 'price', 'created_at', 'updated_at'];
      const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
      const sortDir = sort_order === 'asc' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortColumn} ${sortDir}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Execute query
    const db = req.app.locals.db;
    const { rows } = await db.query(query, queryParams);
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM items WHERE 1=1`;
    const countParams = [];
    let countParamIndex = 1;
    
    // Add the same filters to count query
    if (name) {
      countQuery += ` AND name ILIKE $${countParamIndex}`;
      countParams.push(`%${name}%`);
      countParamIndex++;
    }
    
    if (part_number) {
      countQuery += ` AND part_number ILIKE $${countParamIndex}`;
      countParams.push(`%${part_number}%`);
      countParamIndex++;
    }
    
    if (vehicle_make) {
      countQuery += ` AND vehicle_make ILIKE $${countParamIndex}`;
      countParams.push(`%${vehicle_make}%`);
      countParamIndex++;
    }
    
    if (vehicle_model) {
      countQuery += ` AND vehicle_model ILIKE $${countParamIndex}`;
      countParams.push(`%${vehicle_model}%`);
      countParamIndex++;
    }
    
    if (item_type) {
      countQuery += ` AND item_type = $${countParamIndex}`;
      countParams.push(item_type);
      countParamIndex++;
    }
    
    if (bay) {
      countQuery += ` AND bay = $${countParamIndex}`;
      countParams.push(bay);
      countParamIndex++;
    }
    
    if (min_price) {
      countQuery += ` AND price >= $${countParamIndex}`;
      countParams.push(min_price);
      countParamIndex++;
    }
    
    if (max_price) {
      countQuery += ` AND price <= $${countParamIndex}`;
      countParams.push(max_price);
      countParamIndex++;
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      items: rows,
      pagination: {
        total_items: totalItems,
        total_pages: totalPages,
        current_page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get item
    const { rows } = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    const item = rows[0];
    
    // Get images
    const imagesResult = await db.query('SELECT * FROM images WHERE item_id = $1', [req.params.id]);
    item.images = imagesResult.rows;
    
    // Get OCR results
    const ocrResult = await db.query('SELECT * FROM ocr_results WHERE item_id = $1', [req.params.id]);
    item.ocr_results = ocrResult.rows;
    
    // Get scrape results
    const scrapeResult = await db.query('SELECT * FROM scrape_results WHERE item_id = $1', [req.params.id]);
    item.scrape_results = scrapeResult.rows;
    
    // Get ecommerce listings
    const ecommerceResult = await db.query('SELECT * FROM ecommerce_listings WHERE item_id = $1', [req.params.id]);
    item.ecommerce_listings = ecommerceResult.rows;
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/items
// @desc    Create a new item
// @access  Private
router.post('/', [
  auth,
  body('name', 'Name is required').not().isEmpty(),
  body('part_number', 'Part number is required').optional(),
  body('vehicle_make', 'Vehicle make is required').optional(),
  body('vehicle_model', 'Vehicle model is required').optional(),
  body('weight', 'Weight must be a number').optional().isNumeric(),
  body('width', 'Width must be a number').optional().isNumeric(),
  body('height', 'Height must be a number').optional().isNumeric(),
  body('depth', 'Depth must be a number').optional().isNumeric(),
  body('price', 'Price must be a number').optional().isNumeric(),
  body('item_type', 'Item type is required').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      name,
      part_number,
      vehicle_make,
      vehicle_model,
      weight,
      width,
      height,
      depth,
      color,
      price,
      sku,
      description,
      notes,
      bay,
      item_type,
      thumbnail_url
    } = req.body;
    
    const db = req.app.locals.db;
    
    // Insert new item
    const query = `
      INSERT INTO items (
        name, part_number, vehicle_make, vehicle_model, weight, width, height, depth,
        color, price, sku, description, notes, bay, item_type, thumbnail_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    const values = [
      name, part_number, vehicle_make, vehicle_model, weight, width, height, depth,
      color, price, sku, description, notes, bay, item_type, thumbnail_url
    ];
    
    const { rows } = await db.query(query, values);
    
    // Log the action
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'CREATE', 'items', rows[0].id, JSON.stringify(rows[0])]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/items/:id
// @desc    Update an item
// @access  Private
router.put('/:id', [
  auth,
  body('name', 'Name is required').optional().not().isEmpty(),
  body('weight', 'Weight must be a number').optional().isNumeric(),
  body('width', 'Width must be a number').optional().isNumeric(),
  body('height', 'Height must be a number').optional().isNumeric(),
  body('depth', 'Depth must be a number').optional().isNumeric(),
  body('price', 'Price must be a number').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const checkResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    const oldItem = checkResult.rows[0];
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    const updateableFields = [
      'name', 'part_number', 'vehicle_make', 'vehicle_model', 'weight', 'width', 'height', 'depth',
      'color', 'price', 'sku', 'description', 'notes', 'bay', 'item_type', 'thumbnail_url'
    ];
    
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
        paramIndex++;
      }
    });
    
    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // If no fields to update, return the existing item
    if (updates.length === 1) {
      return res.json(oldItem);
    }
    
    // Add item ID to values array
    values.push(req.params.id);
    
    // Execute update query
    const query = `
      UPDATE items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const { rows } = await db.query(query, values);
    
    // Log the action
    const changes = {};
    updateableFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== oldItem[field]) {
        changes[field] = {
          old: oldItem[field],
          new: req.body[field]
        };
      }
    });
    
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'UPDATE', 'items', rows[0].id, JSON.stringify(changes)]
    );
    
    res.json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const checkResult = await db.query('SELECT * FROM items WHERE id = $1', [req.params.id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Delete item (cascade will handle related records)
    await db.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    
    // Log the action
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'DELETE', 'items', req.params.id, JSON.stringify(checkResult.rows[0])]
    );
    
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
