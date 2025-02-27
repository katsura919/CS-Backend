const mongoose = require("mongoose");
const FaqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    }
}, {
    timestamps: true
});

// Add query helper for tenant isolation
FaqSchema.query.byTenant = function(tenantId) {
    return this.where({ tenantId });
};

// Export the model
const FAQ = mongoose.model("FAQ", FaqSchema);
module.exports = FAQ;