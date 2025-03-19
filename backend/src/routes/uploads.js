const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir;
    
    if (file.fieldname === 'image') {
      uploadDir = path.join(__dirname, '../../../uploads/images');
    } else {
      uploadDir = path.join(__dirname, '../../../uploads/files');
    }
    
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

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  } else {
    // Accept all file types for general uploads
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// @route   POST api/uploads/image
// @desc    Upload an image
// @access  Private
router.post('/image', [auth, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }
    
    // Get the uploaded file path
    const imagePath = req.file.path;
    const imageUrl = `/uploads/images/${path.basename(imagePath)}`;
    
    // If item_id is provided, associate with existing item
    if (req.body.item_id) {
      const db = req.app.locals.db;
      
      // Check if item exists
      const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.body.item_id]);
      
      if (itemCheck.rows.length === 0) {
        return res.status(404).json({ msg: 'Item not found' });
      }
      
      // Store image
      const imageResult = await db.query(
        'INSERT INTO images (item_id, url, is_primary) VALUES ($1, $2, $3) RETURNING *',
        [req.body.item_id, imageUrl, req.body.is_primary === 'true']
      );
      
      // If marked as primary, update item's thumbnail_url
      if (req.body.is_primary === 'true') {
        await db.query(
          'UPDATE items SET thumbnail_url = $1 WHERE id = $2',
          [imageUrl, req.body.item_id]
        );
      }
      
      return res.json({
        image: imageResult.rows[0],
        item_id: req.body.item_id,
        url: imageUrl
      });
    }
    
    // If no item_id, just return the image URL
    res.json({
      url: imageUrl,
      filename: path.basename(imagePath),
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error('Image upload error:', err.message);
    res.status(500).json({ msg: 'Image upload failed', error: err.message });
  }
});

// @route   POST api/uploads/file
// @desc    Upload a general file
// @access  Private
router.post('/file', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    
    // Get the uploaded file path
    const filePath = req.file.path;
    const fileUrl = `/uploads/files/${path.basename(filePath)}`;
    
    res.json({
      url: fileUrl,
      filename: path.basename(filePath),
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    console.error('File upload error:', err.message);
    res.status(500).json({ msg: 'File upload failed', error: err.message });
  }
});

// @route   GET api/uploads/images/:item_id
// @desc    Get all images for an item
// @access  Private
router.get('/images/:item_id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if item exists
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [req.params.item_id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Get images
    const images = await db.query(
      'SELECT * FROM images WHERE item_id = $1 ORDER BY is_primary DESC, created_at DESC',
      [req.params.item_id]
    );
    
    res.json(images.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/uploads/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/images/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if image exists
    const imageCheck = await db.query('SELECT * FROM images WHERE id = $1', [req.params.id]);
    
    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Image not found' });
    }
    
    const image = imageCheck.rows[0];
    
    // Delete image file from filesystem
    const imagePath = path.join(__dirname, '../../../', image.url);
    
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Delete image from database
    await db.query('DELETE FROM images WHERE id = $1', [req.params.id]);
    
    // If this was the primary image, update item's thumbnail_url to null or another image
    if (image.is_primary) {
      // Find another image for this item
      const otherImage = await db.query(
        'SELECT * FROM images WHERE item_id = $1 ORDER BY created_at DESC LIMIT 1',
        [image.item_id]
      );
      
      if (otherImage.rows.length > 0) {
        // Set this as the new primary image
        await db.query(
          'UPDATE images SET is_primary = true WHERE id = $1',
          [otherImage.rows[0].id]
        );
        
        await db.query(
          'UPDATE items SET thumbnail_url = $1 WHERE id = $2',
          [otherImage.rows[0].url, image.item_id]
        );
      } else {
        // No other images, set thumbnail_url to null
        await db.query(
          'UPDATE items SET thumbnail_url = NULL WHERE id = $1',
          [image.item_id]
        );
      }
    }
    
    res.json({ msg: 'Image removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/uploads/images/:id/set-primary
// @desc    Set an image as primary
// @access  Private
router.put('/images/:id/set-primary', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Check if image exists
    const imageCheck = await db.query('SELECT * FROM images WHERE id = $1', [req.params.id]);
    
    if (imageCheck.rows.length === 0) {
      return res.status(404).json({ msg: 'Image not found' });
    }
    
    const image = imageCheck.rows[0];
    
    // Reset all images for this item to not primary
    await db.query(
      'UPDATE images SET is_primary = false WHERE item_id = $1',
      [image.item_id]
    );
    
    // Set this image as primary
    await db.query(
      'UPDATE images SET is_primary = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    
    // Update item's thumbnail_url
    await db.query(
      'UPDATE items SET thumbnail_url = $1 WHERE id = $2',
      [image.url, image.item_id]
    );
    
    res.json({ msg: 'Image set as primary', image_id: req.params.id, item_id: image.item_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
