const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Buyer',
        });

        if (user) {
            // Create a wallet for the user automatically
            const wallet = await Wallet.create({ user: user._id, balance: 0 });

            // Send Welcome Email
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Welcome to EcoMarket Plus! 🌱',
                    text: `Hello ${user.name},\n\nWelcome to EcoMarket Plus! Your account has been successfully created as a ${user.role}.\n\nYour digital wallet is now active and ready for your first sustainable transaction.\n\nHappy Shopping!\nThe EcoMarket Team`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <h2 style="color: #27ae60;">Welcome to EcoMarket Plus! 🌱</h2>
                            <p>Hello <strong>${user.name}</strong>,</p>
                            <p>We're thrilled to have you join our sustainable community! Your account has been successfully created as a <strong>${user.role}</strong>.</p>
                            <p>Your digital wallet is now active and ready for your first eco-friendly transaction.</p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Role:</strong> ${user.role}</p>
                                <p style="margin: 0;"><strong>Status:</strong> Active</p>
                            </div>
                            <p>Visit your dashboard to start exploring!</p>
                            <p>Best regards,<br><strong>The EcoMarket Team</strong></p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Error sending welcome email:', emailError);
                // We don't block registration if email fails
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                address: user.address,
                phone: user.phone,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
            if (req.body.address !== undefined) user.address = req.body.address;
            if (req.body.phone !== undefined) user.phone = req.body.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                address: updatedUser.address,
                phone: updatedUser.phone,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
