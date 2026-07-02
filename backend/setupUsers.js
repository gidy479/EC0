const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function setup() {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const users = [
        { name: 'Admin User', email: 'admin@eco.com', password: 'password123', role: 'Admin' },
        { name: 'Buyer User', email: 'buyer@eco.com', password: 'password123', role: 'Buyer' },
        { name: 'Green Solutions', email: 'info@greensolutions.com', password: 'password123', role: 'Seller' },
    ];

    for (let u of users) {
        const exist = await User.findOne({ email: u.email });
        if (!exist) {
            await User.create(u);
            console.log(`Created: ${u.email}`);
        } else {
            exist.password = u.password;
            exist.role = u.role;
            await exist.save();
            console.log(`Updated: ${u.email}`);
        }
    }
    process.exit(0);
}
setup();
