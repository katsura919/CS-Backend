const express = require('express');

const {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} = require('../controllers/faqController');

const router = express.Router();

router.post('/create', createFAQ);
router.get('/get', getFAQs);
router.get('/getbyid/:id', getFAQById);
router.put('/update/:id', updateFAQ);
router.delete('/delete/:id', deleteFAQ);

module.exports = router;