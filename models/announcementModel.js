const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    postedBy: { type: String, required: true },
  },
  { timestamps: true } 
);

module.exports = mongoose.model("Announcement", announcementSchema);
