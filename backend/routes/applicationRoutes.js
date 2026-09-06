const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const applicationController = require('../controllers/applicationController');

// Optional multer middleware for multipart uploads
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// All application routes strictly require authentication
router.use(auth);

// Create new application for authenticated user
router.post('/', applicationController.createApplication);

// Get all applications owned by authenticated user
router.get('/', applicationController.getMyApplications);

// Get single application by ID (with ownership enforcement)
router.get('/:id', applicationController.getApplicationById);

// Update application parameters
router.put('/:id', applicationController.updateApplication);

// Get application documents (database source of truth)
router.get('/:id/documents', applicationController.getApplicationDocuments);

// Upload & validate document for application (supports both JSON and multipart form data)
router.post('/:id/documents', upload.any(), applicationController.uploadApplicationDocument);

// Delete document from application
router.delete('/:id/documents/:docId', applicationController.deleteApplicationDocument);

// Submit application
router.post('/:id/submit', applicationController.submitApplication);

module.exports = router;

