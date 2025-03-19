const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/images');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  }
});

// @route   POST api/ocr/upload
// @desc    Upload image for OCR processing
// @access  Private
router.post('/upload', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }
    
    // Get the uploaded file path
    const imagePath = req.file.path;
    const imageUrl = `/uploads/images/${path.basename(imagePath)}`;
    
    // Send the image to OCR service
    const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://ocr_service:5001/process';
    
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    const ocrResponse = await axios.post(ocrServiceUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      }
    });
    
    const { text, processed_text } = ocrResponse.data;
    
    // Store OCR result in database
    const db = req.app.locals.db;
    
    // If item_id is provided, associate with existing item
    if (req.body.item_id) {
      // Check if item exists
      const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.body.item_id]);
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({ msg: 'Item not found' });
      }
      
      // Store OCR result
      const ocrResult = await db.query(
        'INSERT INTO ocr_results (item_id, raw_text, processed_text, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [req.body.item_id, text, processed_text, imageUrl]
      );
      
      return res.json({
        ocr_result: ocrResult.rows[0],
        item_id: req.body.item_id
      });
    } else {
      // Create new item with OCR data
      const itemResult = await db.query(
        'INSERT INTO items (name, thumbnail_url) VALUES ($1, $2) RETURNING *',
        [`Item from OCR ${new Date().toISOString()}`, imageUrl]
      );
      
      const newItem = itemResult.rows[0];
      
      // Store OCR result
      const ocrResult = await db.query(
        'INSERT INTO ocr_results (item_id, raw_text, processed_text, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
        [newItem.id, text, processed_text, imageUrl]
      );
      
      return res.json({
        ocr_result: ocrResult.rows[0],
        item: newItem
      });
    }
  } catch (err) {
    console.error('OCR upload error:', err.message);
    res.status(500).json({ msg: 'OCR processing failed', error: err.message });
  }
});

// @route   GET api/ocr/results/:item_id
// @desc    Get OCR results for an item
// @access  Private
router.get('/results/:item_id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.params.item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Get OCR results
    const ocrResults = await db.query(
      'SELECT * FROM ocr_results WHERE item_id = $1 ORDER BY created_at DESC',
      [req.params.item_id]
    );
    
    res.json(ocrResults.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/ocr/results/:id
// @desc    Delete an OCR result
// @access  Private
router.delete('/results/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if OCR result exists
    const ocrCheck = await db.query('SELECT * FROM ocr_results WHERE id = $1', [req.params.id]);
    
    if (ocrCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'OCR result not found' });
    }
    
    // Delete OCR result
    await db.query('DELETE FROM ocr_results WHERE id = $1', [req.params.id]);
    
    res.json({ msg: 'OCR result removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
