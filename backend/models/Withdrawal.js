const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String,
            required: true,
            enum: ['MoMo', 'Bank'],
        },
        accountDetails: {
            phone: { type: String }, // For MoMo
            network: { type: String }, // For MoMo
            accountName: { type: String }, // For Bank
            accountNumber: { type: String }, // For Bank
            bankName: { type: String }, // For Bank
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
