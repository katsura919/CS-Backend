const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
// Tenant Schema
const tenantSchema = new mongoose.Schema({
    registrantName: { type: String, required: true }, // Name of the person registering
    departmentName: { type: String, required: true, unique: true }, // Name of the tenant/department
    slug: { type: String, unique: true }, // URL-friendly version of departmentName (optional)
    email: { type: String, required: true, unique: true }, // For registration/login
    password: { type: String, required: true }, // Hashed password
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
tenantSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare passwords for login
tenantSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Tenant Model
const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;