const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0.0,
            min: 0,
        },
        // Simple transaction history embedded for now, could be a separate model
        transactions: [
            {
                type: {
                    type: String,
                    enum: ['deposit', 'withdrawal', 'purchase', 'sale', 'escrow_hold', 'escrow_release'],
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                },
                description: {
                    type: String,
                },
                date: {
                    type: Date,
                    default: Date.now,
                },
                relatedOrder: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Transaction', // Assuming a Transaction/Order model later
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
