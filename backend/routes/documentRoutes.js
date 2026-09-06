const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Validate uploaded document against database
router.post('/validate', documentController.validateDocument);

// Get all database document records
router.get('/records', documentController.getRecords);

// Add document record to database
router.post('/records', documentController.addRecord);

// Delete document record from database
router.delete('/records/:id', documentController.deleteRecord);

module.exports = router;
