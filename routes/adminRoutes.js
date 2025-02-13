const express = require("express");
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

const router = express.Router();

// Register a new admin
router.post("/register", registerAdmin);

// Admin login
router.post("/login", loginAdmin);

module.exports = router;
