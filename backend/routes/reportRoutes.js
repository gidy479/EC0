const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');

// @desc    Get user-specific overview report
// @route   GET /api/reports/overview
// @access  Private
router.get('/overview', protect, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const isBuyer = req.user.role === 'Buyer';
        const roleFilter = isBuyer ? { buyer: req.user._id } : { seller: req.user._id };
        const dateFilter = { createdAt: { $gte: thirtyDaysAgo } };
        
        // 1. Orders Data
        const orders = await Order.find({ ...roleFilter, ...dateFilter }).populate('product', 'name price');
        
        let salesData = {};
        if (isBuyer) {
            const totalSpent = orders.reduce((acc, order) => acc + order.totalCost, 0);
            const productsBoughtCount = orders.reduce((acc, order) => acc + order.quantity, 0);
            salesData = {
                totalSpent,
                productsBoughtCount,
                totalOrdersPlaced: orders.length,
                recentOrders: orders.slice(-5).reverse()
            };
        } else {
            const totalRevenue = orders.reduce((acc, order) => acc + order.totalCost, 0);
            const totalItemsSold = orders.reduce((acc, order) => acc + order.quantity, 0);
            salesData = {
                totalRevenue,
                totalOrdersReceived: orders.length,
                totalItemsSold,
                recentSales: orders.slice(-5).reverse()
            };
        }

        // 2. Products Data (Only really relevant for Sellers, but we can return basic info for Buyers)
        let productsData = {};
        if (!isBuyer) {
            const products = await Product.find({ seller: req.user._id });
            const lowStockProducts = products.filter(p => p.stock < 5).map(p => ({
                id: p._id,
                name: p.name,
                stock: p.stock
            }));
            productsData = {
                totalProductsListed: products.length,
                lowStockCount: lowStockProducts.length,
                lowStockProducts
            };
        }

        // 3. Transactions Data
        const transactions = await Transaction.find({ ...roleFilter, ...dateFilter });
        const totalVol = transactions.reduce((acc, t) => acc + t.amount, 0);
        const transactionsData = {
            totalTransactions: transactions.length,
            totalVolume: totalVol,
            completedTransactions: transactions.filter(t => t.status === 'completed').length,
            pendingEscrow: transactions.filter(t => t.status === 'escrow_held').length
        };

        res.json({
            sales: salesData,
            products: productsData,
            transactions: transactionsData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving reports' });
    }
});

module.exports = router;
