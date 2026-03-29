const express = require('express');
const router = express.Router();
const axios = require('axios');
const Wallet = require('../models/Wallet');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Withdrawal = require('../models/Withdrawal');
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
            subject: `Order Confirmation - ${product.name} (Order #${newOrder._id.toString().substring(0,8).toUpperCase()})`,
            text: `Thank you for your trust! Your purchase of ${quantity}x ${product.name} is confirmed. Total: GH₵${totalCost.toFixed(2)}. Delivery to ${address}, ${city}.`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                    <div style="background-color: #27ae60; padding: 30px; text-align: center; color: white;">
                        <h2 style="margin: 0; font-size: 24px;">Order Confirmed! 🎉</h2>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Thank you for shopping sustainably with EcoMarket Plus.</p>
                    </div>
                    
                    <div style="padding: 25px;">
                        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                            <h3 style="margin-top: 0; color: #27ae60; font-size: 18px; border-bottom: 2px solid #27ae60; padding-bottom: 8px;">Order Summary</h3>
                            <p style="margin: 12px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">#${newOrder._id.toString().toUpperCase()}</span></p>
                            <p style="margin: 12px 0;"><strong>Product:</strong> ${product.name}</p>
                            <p style="margin: 12px 0;"><strong>Quantity:</strong> ${quantity}</p>
                            <p style="margin: 12px 0; font-size: 18px; color: #2ecc71;"><strong>Total Paid:</strong> GH₵${totalCost.toFixed(2)}</p>
                            <p style="margin: 0; font-size: 13px; color: #7f8c8d;">(Funds are securely held in Escrow until delivery)</p>
                        </div>

                        <div style="margin-bottom: 25px;">
                            <h3 style="margin-top: 0; font-size: 18px; color: #27ae60;">Delivery Information</h3>
                            <p style="margin: 8px 0;"><strong>Address:</strong> ${address}</p>
                            <p style="margin: 8px 0;"><strong>City:</strong> ${city}</p>
                            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
                        </div>

                        <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                        
                        <div style="text-align: center;">
                            <p style="margin-bottom: 20px;">The seller has been notified and will begin preparing your order.</p>
                            <a href="${process.env.FRONTEND_URL}/orders" style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Track Your Order</a>
                        </div>
                    </div>

                    <div style="background-color: #f4f7f6; padding: 20px; text-align: center; font-size: 12px; color: #95a5a6;">
                        <p style="margin: 0;">&copy; 2024 EcoMarket Plus. Growing Sustainably Together.</p>
                    </div>
                </div>
            `
        });

        // Asynchronously Fire Seller Notification Email
        const sellerUser = await require('../models/User').findById(product.seller);
        if (sellerUser) {
            sendEmail({
                to: sellerUser.email,
                subject: `SALE ALERT: Order Received for ${product.name}!`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                        <div style="background-color: #f39c12; padding: 30px; text-align: center; color: white;">
                            <h2 style="margin: 0; font-size: 24px;">New Sale! 💸</h2>
                            <p style="margin: 10px 0 0; opacity: 0.9;">You just received a new order for your product.</p>
                        </div>
                        
                        <div style="padding: 25px;">
                            <div style="background-color: #fdfaf5; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f39c12;">
                                <h3 style="margin-top: 0; color: #d35400; font-size: 18px;">Sale Details</h3>
                                <p style="margin: 10px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px; border-radius: 4px;">#${newOrder._id.toString().toUpperCase()}</span></p>
                                <p style="margin: 10px 0;"><strong>Product:</strong> ${product.name}</p>
                                <p style="margin: 10px 0;"><strong>Quantity:</strong> ${quantity}</p>
                                <p style="margin: 10px 0; font-size: 18px; color: #e67e22;"><strong>Earnings:</strong> GH₵${totalCost.toFixed(2)}</p>
                                <p style="margin: 0; font-size: 13px; color: #7f8c8d;">(Funds will be released after the buyer confirms delivery)</p>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <h3 style="margin-top: 0; font-size: 18px; color: #d35400;">Ship To:</h3>
                                <p style="margin: 8px 0;"><strong>Buyer Name:</strong> ${req.user.name}</p>
                                <p style="margin: 8px 0;"><strong>Address:</strong> ${address}</p>
                                <p style="margin: 8px 0;"><strong>City:</strong> ${city}</p>
                                <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
                            </div>

                            <div style="padding: 15px; background: #fff9ed; border-radius: 6px; font-size: 14px; border: 1px dashed #f39c12;">
                                <strong>💡 Next Step:</strong> Please pack the item securely and ship it immediately. Once shipped, update the order status in your seller dashboard.
                            </div>

                            <hr style="border: 0; border-top: 1px solid #eee; margin: 25px 0;">
                            
                            <div style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #f39c12; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Manage This Order</a>
                            </div>
                        </div>

                        <div style="background-color: #f4f7f6; padding: 20px; text-align: center; font-size: 12px; color: #95a5a6;">
                            <p style="margin: 0;">Keep up the great work selling sustainable products!</p>
                        </div>
                    </div>
                `
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

// @desc    Request a withdrawal
// @route   POST /api/wallet/withdraw
// @access  Private
router.post('/withdraw', protect, async (req, res) => {
    try {
        const { amount, method, accountDetails } = req.body;
        const wallet = await Wallet.findOne({ user: req.user._id });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct balance immediately (move to "pending withdrawal")
        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'withdrawal',
            amount,
            description: `Withdrawal request (${method}) - Pending`
        });
        await wallet.save();

        const withdrawal = await Withdrawal.create({
            user: req.user._id,
            amount,
            method,
            accountDetails
        });

        res.status(201).json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user withdrawal history
// @route   GET /api/wallet/withdrawals
// @access  Private
router.get('/withdrawals', protect, async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update withdrawal status (Admin)
// @route   PUT /api/wallet/withdrawals/:id/status
// @access  Private/Admin
router.put('/withdrawals/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const withdrawal = await Withdrawal.findById(req.params.id);

        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        withdrawal.status = status;
        withdrawal.processedAt = Date.now();
        await withdrawal.save();

        // If rejected, refund the wallet
        if (status === 'rejected') {
            const wallet = await Wallet.findOne({ user: withdrawal.user });
            wallet.balance += withdrawal.amount;
            wallet.transactions.push({
                type: 'deposit',
                amount: withdrawal.amount,
                description: `Refund for rejected withdrawal request #${withdrawal._id.toString().substring(0,8).toUpperCase()}`
            });
            await wallet.save();
        }

        res.json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
