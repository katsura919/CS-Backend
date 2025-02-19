const Announcement = require("../models/announcementModel");
const mongoose = require("mongoose")

// 📌 Create a new announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, details, postedBy } = req.body;
    if (!title || !details || !postedBy) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const announcement = new Announcement({ title, details, postedBy });
    await announcement.save();

    res.status(201).json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "An error occurred while creating the announcement" });
  }
};

// 📌 Fetch all announcements (latest first)
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "An error occurred while fetching announcements" });
  }
};

// 📌 Fetch a single announcement by ID
const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid announcement ID" });
    }

    // Fetch announcement
    const announcement = await Announcement.findById(id).lean(); // Using `.lean()` for better performance

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 📌 Update an announcement by ID
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, details, postedBy } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { title, details, postedBy },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ message: "Announcement updated successfully", updatedAnnouncement });
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "An error occurred while updating the announcement" });
  }
};

// 📌 Delete an announcement by ID
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "An error occurred while deleting the announcement" });
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
