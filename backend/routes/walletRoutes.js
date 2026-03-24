const express = require('express');
const router = express.Router();
const axios = require('axios');
const Wallet = require('../models/Wallet');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (wallet) {
            res.json(wallet);
        } else {
            res.status(404).json({ message: 'Wallet not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get seller earnings
// @route   GET /api/wallet/earnings
// @access  Private
router.get('/earnings', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ seller: req.user._id });
        const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        res.json({ totalEarnings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Verify Paystack deposit and update wallet
// @route   POST /api/wallet/verify-paystack-deposit
// @access  Private
router.post('/verify-paystack-deposit', protect, async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ message: 'Transaction reference is required' });
        }

        const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecret) {
            return res.status(500).json({ message: 'Paystack is not configured on this server.' });
        }

        // Verify the transaction with Paystack API
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${paystackSecret}`
            }
        });

        const data = paystackRes.data;

        if (!data.status || data.data.status !== 'success') {
            return res.status(400).json({ message: 'Payment verification failed' });
        }

        // Amount comes from Paystack in kobo/pesewas/cents depending on currency.
        // Assuming your app works in whole numbers (Naira/Cedis/Dollars), divide by 100.
        // We ensure we only process the *actual* amount deposited.
        const amountDeposited = data.data.amount / 100;

        // Check if we already processed this exact reference to prevent double crediting
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        const isAlreadyProcessed = wallet.transactions.some(t => t.description.includes(reference));
        if (isAlreadyProcessed) {
            return res.status(400).json({ message: 'This transaction was already securely processed.' });
        }

        wallet.balance += amountDeposited;
        wallet.transactions.push({
            type: 'deposit',
            amount: amountDeposited,
            description: `Funds deposited via Paystack (Ref: ${reference})`,
        });

        await wallet.save();
        res.json({ message: 'Deposit successful!', wallet });
        console.log(`Successfully credited $${amountDeposited} to user ${req.user._id} via Paystack.`);

    } catch (error) {
        console.error("Paystack Verification Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.response?.data?.message || error.message });
    }
});

// @desc    Purchase a product using wallet balance
// @route   POST /api/wallet/purchase/:id
// @access  Private
router.post('/purchase/:id', protect, async (req, res) => {
    try {
        const productId = req.params.id;
        const { quantity: rawQuantity, address, city, phone } = req.body;
        const quantity = parseInt(rawQuantity) || 1;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        if (!address || !city || !phone) {
            return res.status(400).json({ message: 'Delivery address, city, and phone are required' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: `Only ${product.stock} items are in stock` });
        }

        if (product.verificationStatus !== 'verified') {
            return res.status(400).json({ message: 'Cannot purchase unverified product' });
        }

        const wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found for buyer' });
        }

        const totalCost = product.price * quantity;

        if (wallet.balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient trust wallet balance' });
        }

        // Deduct balance and update stock
        wallet.balance -= totalCost;
        product.stock -= quantity;

        // Create transaction record
        const newTransaction = new Transaction({
            buyer: req.user._id,
            seller: product.seller,
            product: product._id,
            amount: totalCost,
            quantity: quantity,
            status: 'escrow_held', // Assuming funds are held in escrow
        });

        // Record in wallet history
        wallet.transactions.push({
            type: 'purchase',
            amount: totalCost,
            description: `Purchased ${quantity}x ${product.name}`,
            relatedOrder: newTransaction._id
        });

        // Add to seller's wallet? Wait, usually we hold in escrow, so we might just add to escrow balance or wait until delivery.
        // For now, we will just hold the escrow in the Transaction object and deduct from buyer.

        // Create the physical order for tracking
        const newOrder = new Order({
            buyer: req.user._id,
            seller: product.seller,
            product: product._id,
            transaction: newTransaction._id,
            quantity,
            totalCost,
            deliveryDetails: {
                address,
                city,
                phone
            }
        });

        await wallet.save();
        await product.save();
        await newTransaction.save();
        await newOrder.save();
        
        // Asynchronously Fire Buyer Transaction Email
        sendEmail({
            to: req.user.email,
            subject: `Order Confirmation - ${product.name}`,
            text: `Thank you for your trust! Your purchase of ${quantity}x ${product.name} (Order #${newOrder._id}) is confirmed and funds are securely held in escrow until delivery. Total Paid: GH₵${totalCost.toFixed(2)}. Delivery Address: ${address}, ${city}. \n\nWe will notify you the moment it ships!`,
            html: `
                <h3>Order Confirmed! 🎉</h3>
                <p>Thank you for your trust! Your purchase of <strong>${quantity}x ${product.name}</strong> is confirmed.</p>
                <p><strong>Order ID:</strong> ${newOrder._id}</p>
                <p><strong>Total Paid:</strong> GH₵${totalCost.toFixed(2)} (Securely held in Escrow)</p>
                <p><strong>Delivery Details:</strong> ${address}, ${city}</p>
                <br>
                <p><em>We will alert you the moment the seller ships your items!</em></p>
            `
        });

        // Asynchronously Fire Seller Notification Email
        const sellerUser = await require('../models/User').findById(product.seller);
        if (sellerUser) {
            sendEmail({
                to: sellerUser.email,
                subject: `SALE ALERT: You sold ${product.name}!`,
                html: `<h3>Great News!</h3><p>You just sold <strong>${quantity}x ${product.name}</strong> for GH₵${totalCost.toFixed(2)}.</p><p>Please prepare to ship to: <strong>${address}, ${city}</strong>.</p>`
            });
        }

        res.json({ message: `Successfully purchased ${quantity}x ${product.name}!`, orderId: newOrder._id });
    } catch (error) {
        console.error("Purchase Error:", error);
        res.status(500).json({ message: 'Server error during purchase' });
    }
});

// @desc    Dispute an order
// @route   PUT /api/wallet/dispute/:orderId
// @access  Private
router.put('/dispute/:orderId', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('transaction');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        if (order.buyer.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to dispute this order' });
        }

        const transaction = await Transaction.findById(order.transaction._id);
        if (transaction.status !== 'escrow_held') {
            return res.status(400).json({ message: 'Can only dispute orders currently held in escrow' });
        }

        transaction.status = 'disputed';
        transaction.disputeReason = req.body.reason || 'No reason provided';
        await transaction.save();

        res.json({ message: 'Order dispute filed successfully', transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Resolve a disputed order
// @route   PUT /api/wallet/resolve/:orderId
// @access  Private/Admin
router.put('/resolve/:orderId', protect, admin, async (req, res) => {
    try {
        const { resolution } = req.body; // 'refund_buyer' or 'release_to_seller'
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const transaction = await Transaction.findById(order.transaction);

        if (transaction.status !== 'disputed') {
            return res.status(400).json({ message: 'Transaction is not disputed' });
        }

        if (resolution === 'refund_buyer') {
            const buyerWallet = await Wallet.findOne({ user: transaction.buyer });
            buyerWallet.balance += transaction.amount;
            buyerWallet.transactions.push({
                type: 'deposit',
                amount: transaction.amount,
                description: `Refund for disputed order ${order._id}`
            });
            await buyerWallet.save();
            transaction.status = 'refunded';
            
            // Restock the product
            const product = await Product.findById(transaction.product);
            if (product) {
                product.stock += transaction.quantity;
                await product.save();
            }

        } else if (resolution === 'release_to_seller') {
            const sellerWallet = await Wallet.findOne({ user: transaction.seller });
            if (!sellerWallet) {
                await Wallet.create({ user: transaction.seller, balance: transaction.amount, transactions: [{
                    type: 'deposit',
                    amount: transaction.amount,
                    description: `Escrow release from dispute resolution ${order._id}`
                }]});
            } else {
                sellerWallet.balance += transaction.amount;
                sellerWallet.transactions.push({
                    type: 'deposit',
                    amount: transaction.amount,
                    description: `Escrow release from dispute resolution ${order._id}`
                });
                await sellerWallet.save();
            }
            transaction.status = 'completed';
            transaction.escrowReleasedAt = Date.now();
        } else {
            return res.status(400).json({ message: 'Invalid resolution action. Options: refund_buyer, release_to_seller' });
        }

        await transaction.save();

        // Asynchronously Notify the Buyer of Admin Resolution
        const buyerUser = await require('../models/User').findById(transaction.buyer);
        if (buyerUser) {
            sendEmail({
                to: buyerUser.email,
                subject: `Dispute Resolved: Order #${order._id.toString().substring(0,8).toUpperCase()}`,
                text: `An Admin has reviewed your disputed order. The resolution decision was: ${resolution === 'refund_buyer' ? 'Fully Refunded to your Trust Wallet' : 'Released to the Seller'}.`,
            });
        }

        res.json({ message: `Dispute resolved: ${resolution}`, transaction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
