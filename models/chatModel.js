
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true },
  isGoodResponse: { type: Boolean, default: null }, 
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Chat", chatSchema);
