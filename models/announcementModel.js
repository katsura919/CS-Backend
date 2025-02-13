const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },
  postedBy: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, // Timestamp for sorting
});

module.exports = mongoose.model("Announcement", announcementSchema);
