const express = require('express');

const {
  createProcess,
  getProcesses,
  getProcessById,
  updateProcess,
  deleteProcess,
} = require('../controllers/processController');

const router = express.Router();

router.post('/create', createProcess);
router.get('/get', getProcesses);
router.get('/getbyid/:id', getProcessById);
router.put('/update/:id', updateProcess);
router.delete('/delete/:id', deleteProcess);

module.exports = router;