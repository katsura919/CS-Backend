// routes/askRoutes.js
const express = require("express");
const { askAI } = require("../controllers/askController");

const router = express.Router();

router.post("/chat", askAI);

module.exports = router;