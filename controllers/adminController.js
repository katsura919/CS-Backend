const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

// Secret key for JWT (use environment variable in production)
const JWT_SECRET = "your_secret_key"; 

// Register a new admin
exports.registerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) return res.status(400).json({ error: "Username already taken" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

// Admin login
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ error: "Invalid username or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid username or password" });

    // Generate JWT token
    const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};
