const express = require("express");
const { register, login } = require("../controllers/tenantController");

const router = express.Router();

// Register a new admin
router.post("/register", register);

// Admin login
router.post("/login", login);

module.exports = router;
