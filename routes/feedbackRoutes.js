// routes/askRoutes.js
const express = require("express");
const { feedbackAI } = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", feedbackAI);

module.exports = router;