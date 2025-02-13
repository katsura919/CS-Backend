const express = require("express");

const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.post("/create", createAnnouncement);
router.get("/get", getAnnouncements);
router.get("/getbyid/:id", getAnnouncementById);
router.put("/update/:id", updateAnnouncement);
router.delete("/delete/:id", deleteAnnouncement);

module.exports = router;
