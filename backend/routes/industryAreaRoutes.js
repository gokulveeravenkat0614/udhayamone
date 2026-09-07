const express = require('express');
const router = express.Router();
const industryAreaController = require('../controllers/industryAreaController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// Public endpoints
router.get('/states', industryAreaController.getStates);
router.get('/search', industryAreaController.search);
router.get('/', industryAreaController.getAreas);

// Admin-managed endpoints
router.post('/', auth, admin, industryAreaController.createArea);
router.put('/:id', auth, admin, industryAreaController.updateArea);
router.delete('/:id', auth, admin, industryAreaController.deleteArea);

module.exports = router;
