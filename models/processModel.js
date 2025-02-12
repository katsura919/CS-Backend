const mongoose = require('mongoose');

const processSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  steps: [{ type: String, required: true }],
});

module.exports = mongoose.model('Process', processSchema);
