const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const User = require('../models/user');
const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF and Word documents are allowed!');
    }
  },
}).single('cv');

// Upload CV file
// The full path will be /api/cv because this router is mounted at /api in server.js
router.post('/cv', auth, (req, res) => {
  console.log('CV upload request received');
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false, 
          message: 'File size too large. Maximum size is 5MB.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: err.message || 'Error uploading file' 
      });
    }

    if (!req.file) {
      console.log('No file was included in the request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file was uploaded or the file type is not supported' 
      });
    }

    try {
      console.log('File uploaded successfully:', req.file.filename);
      const fileUrl = `/uploads/${req.file.filename}`;
      
      console.log('Updating user profile with CV path:', fileUrl);
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { 
          $set: { 
            'resume': fileUrl,
            'currentCVData.resume': fileUrl,
            'updatedAt': new Date()
          } 
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('User not found');
      }

      console.log('CV update successful for user:', req.user.id);
      res.json({
        success: true,
        message: 'CV uploaded successfully',
        filePath: fileUrl,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error processing CV upload:', error);
      // Clean up uploaded file if there was an error
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Cleaned up file after error:', req.file.filename);
        } catch (cleanupErr) {
          console.error('Error cleaning up file:', cleanupErr);
        }
      }
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Error processing CV upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

// Serve uploaded files
router.use('/uploads', express.static(uploadsDir));

// Download CV endpoint with forced download headers
router.get('/download-cv/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'CV file not found' 
      });
    }
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading CV file' 
    });
  }
});

// Test endpoint to verify the upload route is accessible
router.get('/test-upload', (req, res) => {
  console.log('Test upload endpoint hit');
  res.status(200).json({ 
    success: true, 
    message: 'CV upload endpoint is working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for POST requests
router.post('/test-upload', (req, res) => {
  console.log('Test POST upload endpoint hit');
  res.status(200).json({ 
    success: true, 
    message: 'CV upload POST endpoint is working',
    timestamp: new Date().toISOString(),
    receivedData: req.body
  });
});

// Test route
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'File upload endpoint is working' });
});

module.exports = router;
