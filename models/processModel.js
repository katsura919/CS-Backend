const mongoose = require('mongoose');

const processSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    steps: [{ type: String, required: true }],
    embedding: { type: [Number], required:"true" }, // Vector embedding field
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model('Process', processSchema);
