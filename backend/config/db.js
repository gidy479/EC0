const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Tip: Ensure your MongoDB Atlas IP Access List allows connections from all IPs (0.0.0.0/0) for Render.');
        process.exit(1);
    }
};

module.exports = connectDB;
