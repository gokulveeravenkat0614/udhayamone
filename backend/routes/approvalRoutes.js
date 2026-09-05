const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');

router.post('/evaluate', approvalController.evaluate);
router.get('/catalog', approvalController.getCatalog);
router.get('/dependencies', approvalController.getDependencies);

module.exports = router;
