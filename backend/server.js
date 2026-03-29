require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// app initializations
const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(origin => origin); // Remove undefined/null

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
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

// Ensure uploads directory exists
const uploadsPath = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

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

// Global Error Handler (ensure JSON response)
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        const HOST = '0.0.0.0';

        app.listen(PORT, HOST, () => {
            console.log(`Server running on http://${HOST}:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
