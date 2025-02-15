// routes/chatRoutes.js
const express = require("express");
const { getChatResponseStats, getResponseCounts } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/chat-response-stats", getChatResponseStats);
router.get("/response-count", getResponseCounts);
module.exports = router;
