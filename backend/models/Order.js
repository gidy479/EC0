const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Transaction',
        },
        deliveryDetails: {
            address: { type: String, required: true },
            city: { type: String, required: true },
            phone: { type: String, required: true },
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        totalCost: {
            type: Number,
            required: true,
        },
        trackingStatus: {
            type: String,
            enum: ['Processing', 'Shipped', 'Delivered'],
            default: 'Processing',
        }
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
