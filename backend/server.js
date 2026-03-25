require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/wallet', require('./routes/walletRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/verify', require('./routes/verifyRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
const path = require('path');
const fs = require('fs');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Basic Route
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../frontend/dist');
    if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));
        app.get(/.*/, (req, res) => {
            res.sendFile(path.resolve(frontendPath, 'index.html'));
        });
        console.log('Serving frontend from:', frontendPath);
    } else {
        console.log('Frontend dist folder not found at:', frontendPath);
        app.get('/', (req, res) => {
            res.send('Backend is running, but frontend build is missing.');
        });
    }
} else {
    app.get('/api/status', (req, res) => {
        res.json({ status: 'API is running...' });
    });
}

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; 

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
