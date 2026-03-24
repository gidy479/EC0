const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all products (including pending/rejected)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, admin, async (req, res) => {
    try {
        const products = await Product.find({}).populate('seller', 'name email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify or Reject product manually
// @route   PUT /api/admin/products/:id/verify
// @access  Private/Admin
router.put('/products/:id/verify', protect, admin, async (req, res) => {
    try {
        const { status } = req.body; // Expects 'verified' or 'rejected'
        const product = await Product.findById(req.params.id);

        if (product) {
            product.verificationStatus = status;
            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all orders (for resolving disputes)
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('buyer', 'name email')
            .populate('seller', 'name email')
            .populate('product', 'name')
            .populate('transaction');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update order tracking status
// @route   PUT /api/admin/orders/:id/tracking
// @access  Private/Admin
router.put('/orders/:id/tracking', protect, admin, async (req, res) => {
    try {
        const { trackingStatus } = req.body;
        const order = await Order.findById(req.params.id).populate('buyer');
        
        if (order) {
            order.trackingStatus = trackingStatus;
            const updatedOrder = await order.save();
            
            // Send tracking notification email asynchronously
            const sendEmail = require('../utils/sendEmail');
            sendEmail({
                to: order.buyer.email,
                subject: `Shipping Update: Order is ${trackingStatus}!`,
                text: `Good news! Your order #${order._id.toString().substring(0,8).toUpperCase()} has formally been marked as: ${trackingStatus}.\n\nPlease check your dashboard for full status updates.`
            });

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
