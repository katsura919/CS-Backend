// routes/chatRoutes.js
const express = require("express");
const { getChatResponseStats } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/chat-response-stats", getChatResponseStats);

module.exports = router;
