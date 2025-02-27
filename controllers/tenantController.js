const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Tenant = require("../models/tenantModel");
// Secret key for JWT (use environment variable in production)
const JWT_SECRET = "your_secret_key";

// Register a new tenant (department)
const slugify = (str) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };
  
  exports.register = async (req, res) => {
    try {
      const { registrantName, departmentName, email, password } = req.body;
      
      // Check if tenant already exists (by email or departmentName)
      const existingTenantByEmail = await Tenant.findOne({ email });
      if (existingTenantByEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const existingTenantByName = await Tenant.findOne({ departmentName });
      if (existingTenantByName) {
        return res.status(400).json({ error: "Department name already exists" });
      }
      
      // Generate slug from department name
      const baseSlug = slugify(departmentName);
      let slug = baseSlug;
      let counter = 1;
      
      // Check for unique slug
      while (true) {
        const existingTenantWithSlug = await Tenant.findOne({ slug });
        if (!existingTenantWithSlug) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      // Create new tenant with generated slug
      const newTenant = new Tenant({
        registrantName,
        departmentName,
        email,
        password,
        slug
      });
      
      // Save the tenant
      await newTenant.save();
      
      res.status(201).json({
        message: "Tenant registered successfully",
        tenant: {
          id: newTenant._id,
          registrantName: newTenant.registrantName,
          departmentName: newTenant.departmentName,
          email: newTenant.email,
          slug: newTenant.slug
        }
      });
    } catch (error) {
      console.error("Error registering tenant:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  };

// Tenant login
exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
      
      // Check if tenant exists
      const tenant = await Tenant.findOne({ email });
      if (!tenant) {
          return res.status(400).json({ error: "Invalid email or password" });
      }
      
      // Compare password
      const isMatch = await tenant.comparePassword(password);
      if (!isMatch) {
          return res.status(400).json({ error: "Invalid email or password" });
      }
      
      // Generate JWT token (no expiration)
      const token = jwt.sign(
          { tenantId: tenant._id }, // Include tenant ID in the token payload
          JWT_SECRET
      );
      
      res.json({
          message: "Login successful",
          token,
          tenant: {
              id: tenant._id,
              registrantName: tenant.registrantName,
              departmentName: tenant.departmentName,
              email: tenant.email,
              slug: tenant.slug
          },
      });
  } catch (error) {
      console.error("Error logging in tenant:", error);
      res.status(500).json({ error: "An error occurred" });
  }
};