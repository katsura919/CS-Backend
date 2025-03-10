const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
        trim: true
    },
    response: {
        type: String,
        required: true,
        trim: true
    },
    isGoodResponse: {
        type: Boolean,
        default: null
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        required: true
    }
});

// Add query helper for tenant isolation
chatSchema.query.byTenant = function(tenantId) {
    return this.where({ tenantId });
};

// Export the model
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;