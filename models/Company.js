const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        invite: {
            key: String,
            createdAt: Date,
            used: { type: Boolean, default: false },
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Company", companySchema);
