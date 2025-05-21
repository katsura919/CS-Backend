const express = require('express');
const router = express.Router();
const knowledgeController = require('../controllers/knowledgeController');

// Create knowledge entry
router.post('/', knowledgeController.createKnowledge);

// Get all knowledge for a business
router.get('/business/:businessId', knowledgeController.getKnowledgeByBusiness);

// Get single knowledge entry
router.get('/:id', knowledgeController.getKnowledgeById);

module.exports = router;
