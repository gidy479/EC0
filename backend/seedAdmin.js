const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@ecomarket.com';
        const adminPassword = 'admin12345';

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Updating password to admin12345...');
            existingAdmin.password = adminPassword;
            existingAdmin.role = 'Admin';
            await existingAdmin.save();
        } else {
            console.log('Creating new Admin account...');
            const adminUser = await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'Admin'
            });
            
            // Create wallet for admin just in case
            await Wallet.create({ user: adminUser._id, balance: 0 });
            console.log('Admin account created successfully!');
        }

        console.log('-----------------------------------');
        console.log('Email:    admin@ecomarket.com');
        console.log('Password: admin12345');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
