require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const connectDB = require('./config/db');

const products = [
    {
        name: "Premium Bamboo Toothbrush",
        price: 15.00,
        stock: 200,
        description: "100% biodegradable and zero-waste bamboo toothbrush. Features a beautifully crafted, ergonomic natural bamboo handle and premium soft bristles. A simple, elegant step toward eliminating plastic waste from your daily routine.",
        ecoLabels: ["Biodegradable", "Plastic-Free"],
        verificationStatus: "verified",
        verificationReasoning: "Material analysis confirms 100% natural, fast-growing FSC-certified Moso bamboo.",
        aiConfidenceScore: 0.98,
        images: ["/uploads/bamboo_toothbrush_1774352921098.png"]
    },
    {
        name: "Sleek Stainless Steel Water Bottle",
        price: 45.00,
        stock: 120,
        description: "A beautifully designed, minimalist reusable water bottle crafted from high-grade stainless steel. Vacuum insulated to keep your drinks ice cold for 24 hours or piping hot for 12 hours. Say goodbye to single-use plastic bottles forever.",
        ecoLabels: ["Reusable", "BPA-Free", "Zero-Waste"],
        verificationStatus: "verified",
        verificationReasoning: "Verified 304 food-grade stainless steel construction. Free from lead, BPA, and toxic liners.",
        aiConfidenceScore: 0.96,
        images: ["/uploads/stainless_steel_bottle_1774352935659.png"]
    },
    {
        name: "High-Capacity Solar Power Bank",
        price: 85.00,
        stock: 50,
        description: "A modern, rugged solar-powered charger device. Built with advanced monocrystalline silicon solar panels, it harvests clean solar energy anywhere you go. Keeps your devices charged using 100% renewable energy off-grid.",
        ecoLabels: ["Renewable Energy", "Solar Powered"],
        verificationStatus: "verified",
        verificationReasoning: "Solar conversion efficiency verified. E-waste reduction compliance confirmed.",
        aiConfidenceScore: 0.94,
        images: ["/uploads/solar_power_bank_1774352956482.png"]
    },
    {
        name: "Organic Cotton Eco-Tote Bag",
        price: 25.00,
        stock: 300,
        description: "A durable and stylish everyday tote bag made entirely from GOTS certified organic cotton. Its minimalist aesthetic matches any outfit, and its strong natural fibers mean you'll never need a plastic shopping bag again.",
        ecoLabels: ["Organic Cotton", "Cruelty-Free", "Reusable"],
        verificationStatus: "verified",
        verificationReasoning: "GOTS organic certification validated. No synthetic dyes or polyester blends detected.",
        aiConfidenceScore: 0.97,
        images: ["/uploads/organic_tote_bag_1774352972437.png"]
    },
    {
        name: "Artisanal Beeswax Food Wraps",
        price: 22.00,
        stock: 150,
        description: "An incredibly beautiful and functional alternative to plastic wrap. Handcrafted with GOTS certified organic cotton, sustainably harvested beeswax, organic jojoba oil, and tree resin. Keep your food fresh naturally.",
        ecoLabels: ["Compostable", "Reusable"],
        verificationStatus: "verified",
        verificationReasoning: "Ingredients strictly composed of organic natural fibers and food-safe sustainable wax.",
        aiConfidenceScore: 0.93,
        images: ["/uploads/beeswax_wraps_1774352989780.png"]
    }
];

const seedProducts = async () => {
    try {
        await connectDB();

        let targetSeller = await User.findOne({ role: 'Seller' });

        if (!targetSeller) {
            console.log("No Seller found. Creating Green Solutions Merchant...");
            targetSeller = new User({
                name: "Green Solutions",
                email: "info@greensolutions.com",
                password: "password123",
                role: "Seller"
            });
            await targetSeller.save();
        } else {
            console.log("Updating existing Seller name to Green Solutions...");
            targetSeller.name = "Green Solutions";
            await targetSeller.save();
        }

        console.log(`Using seller: ${targetSeller.name} (${targetSeller._id})`);

        // Attach seller ID to products and insert
        const productsToInsert = products.map(p => ({ ...p, seller: targetSeller._id }));

        console.log("Clearing old products, orders, and transactions...");
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Transaction.deleteMany({});

        await Product.insertMany(productsToInsert);
        console.log("Successfully seeded 10 Ghanaian products!");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding products:", error);
        process.exit(1);
    }
};

seedProducts();
