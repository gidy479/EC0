const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get logged in user orders (as buyer)
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate('product', 'name images price')
            .populate('seller', 'name')
            .populate('transaction')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Private
router.get('/seller', protect, async (req, res) => {
    try {
        const orders = await Order.find({ seller: req.user._id })
            .populate('product', 'name price')
            .populate('buyer', 'name email')
            .populate('transaction')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order tracking status (Seller only for their own products)
// @route   PUT /api/orders/:id/tracking
// @access  Private/Seller
router.put('/:id/tracking', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if the user is the seller or the buyer of this order
        const isSeller = order.seller.toString() === req.user._id.toString();
        const isBuyer = order.buyer.toString() === req.user._id.toString();

        if (!isSeller && !isBuyer) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        const { trackingStatus } = req.body;
        if (!['Processing', 'Shipped', 'Delivered'].includes(trackingStatus)) {
            return res.status(400).json({ message: 'Invalid tracking status' });
        }

        order.trackingStatus = trackingStatus;
        await order.save();

        // New Logic: If status is Delivered, release funds from escrow to seller wallet
        if (trackingStatus === 'Delivered') {
            const transaction = await Transaction.findById(order.transaction);
            if (transaction && transaction.status === 'escrow_held') {
                const sellerWallet = await Wallet.findOne({ user: order.seller });
                if (sellerWallet) {
                    sellerWallet.balance += transaction.amount;
                    sellerWallet.transactions.push({
                        type: 'deposit',
                        amount: transaction.amount,
                        description: `Escrow release for order #${order._id.toString().substring(0, 8).toUpperCase()}`
                    });
                    await sellerWallet.save();
                    
                    transaction.status = 'released_to_seller';
                    transaction.escrowReleasedAt = Date.now();
                    await transaction.save();
                }
            }
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
