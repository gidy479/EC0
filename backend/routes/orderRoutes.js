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

module.exports = router;
