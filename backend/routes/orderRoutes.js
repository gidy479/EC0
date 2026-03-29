const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
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

        // Check if the user is the seller of this order
        if (order.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        const { trackingStatus } = req.body;
        if (!['Processing', 'Shipped', 'Delivered'].includes(trackingStatus)) {
            return res.status(400).json({ message: 'Invalid tracking status' });
        }

        order.trackingStatus = trackingStatus;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
