const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');

// @route   POST api/scraper/search
// @desc    Search for item details using web scraping
// @access  Private
router.post('/search', auth, async (req, res) => {
  try {
    const { query, item_id, sources } = req.body;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Send the query to scraper service
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL || 'http://scraper_service:5002/search';
    
    const scraperResponse = await axios.post(scraperServiceUrl, {
      query,
      sources: sources || ['general', 'specialized']
    });
    
    const { results } = scraperResponse.data;
    
    // Store scraper results in database if item_id is provided
    if (item_id) {
      const db = req.app.locals.db;
      
      // Check if item exists
      const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [item_id]);
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({ msg: 'Item not found' });
      }
      
      // Store each scrape result
      const storedResults = [];
      
      for (const result of results) {
        const scrapeResult = await db.query(
          'INSERT INTO scrape_results (item_id, source_url, scraped_data) VALUES ($1, $2, $3) RETURNING *',
          [item_id, result.source_url, JSON.stringify(result.data)]
        );
        
        storedResults.push(scrapeResult.rows[0]);
      }
      
      return res.json({
        scrape_results: storedResults,
        item_id
      });
    }
    
    // If no item_id, just return the results
    res.json({ results });
  } catch (err) {
    console.error('Scraper search error:', err.message);
    res.status(500).json({ msg: 'Scraper search failed', error: err.message });
  }
});

// @route   POST api/scraper/enrich
// @desc    Enrich item with scraped data
// @access  Private
router.post('/enrich/:item_id', auth, async (req, res) => {
  try {
    const { scrape_result_id } = req.body;
    
    if (!scrape_result_id) {
      return res.status(400).json({ msg: 'Scrape result ID is required' });
    }
    
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.params.item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Check if scrape result exists
    const scrapeCheck = await db.query('SELECT * FROM scrape_results WHERE id = $1', [scrape_result_id]);
    
    if (scrapeCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Scrape result not found' });
    }
    
    const scrapeData = scrapeCheck.rows[0].scraped_data;
    
    // Update item with scraped data
    const updates = [];
    const values = [];
    let paramIndex = 1;
    
    // Map scraped data to item fields
    const fieldMapping = {
      name: scrapeData.title || scrapeData.name,
      part_number: scrapeData.part_number || scrapeData.sku,
      vehicle_make: scrapeData.vehicle_make || scrapeData.make,
      vehicle_model: scrapeData.vehicle_model || scrapeData.model,
      weight: scrapeData.weight,
      width: scrapeData.width || (scrapeData.dimensions ? scrapeData.dimensions.width : null),
      height: scrapeData.height || (scrapeData.dimensions ? scrapeData.dimensions.height : null),
      depth: scrapeData.depth || (scrapeData.dimensions ? scrapeData.dimensions.depth : null),
      color: scrapeData.color,
      price: scrapeData.price,
      description: scrapeData.description,
      thumbnail_url: scrapeData.image_url || scrapeData.thumbnail
    };
    
    // Build update query
    Object.entries(fieldMapping).forEach(([field, value]) => {
      if (value !== undefined && value !== null) {
        updates.push(`${field} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });
    
    // If no fields to update, return the existing item
    if (updates.length === 0) {
      return res.json({
        msg: 'No fields to update',
        item: itemCheck.rows[0]
      });
    }
    
    // Add item ID to values array
    values.push(req.params.item_id);
    
    // Execute update query
    const query = `
      UPDATE items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    // Log the enrichment
    await db.query(
      'INSERT INTO audit_log (user_id, action, table_name, record_id, changes) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'ENRICH', 'items', req.params.item_id, JSON.stringify({ scrape_result_id, applied_fields: Object.keys(fieldMapping).filter(k => fieldMapping[k] !== undefined && fieldMapping[k] !== null) })]
    );
    
    res.json({
      msg: 'Item enriched with scraped data',
      item: result.rows[0]
    });
  } catch (err) {
    console.error('Scraper enrich error:', err.message);
    res.status(500).json({ msg: 'Scraper enrichment failed', error: err.message });
  }
});

// @route   GET api/scraper/results/:item_id
// @desc    Get scraper results for an item
// @access  Private
router.get('/results/:item_id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.params.item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Get scraper results
    const scrapeResults = await db.query(
      'SELECT * FROM scrape_results WHERE item_id = $1 ORDER BY created_at DESC',
      [req.params.item_id]
    );
    
    res.json(scrapeResults.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/scraper/results/:id
// @desc    Delete a scraper result
// @access  Private
router.delete('/results/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if scrape result exists
    const scrapeCheck = await db.query('SELECT * FROM scrape_results WHERE id = $1', [req.params.id]);
    
    if (scrapeCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Scrape result not found' });
    }
    
    // Delete scrape result
    await db.query('DELETE FROM scrape_results WHERE id = $1', [req.params.id]);
    
    res.json({ msg: 'Scrape result removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
