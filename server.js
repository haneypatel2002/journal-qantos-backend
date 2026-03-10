const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

let lastDbError = null;

// Database connection middleware
app.use(async (req, res, next) => {
    try {
        await connectDB();
        lastDbError = null;
        next();
    } catch (error) {
        lastDbError = error.message;
        console.error('Database middleware error:', error.message);
        // We don't block the request here, but controllers will fail gracefully 
        // OR we can return an error if it's an API route
        if (req.path.startsWith('/api')) {
            return res.status(500).json({
                message: 'Database connection error',
                error: error.message
            });
        }
        next();
    }
});


app.get('/', (req, res) => {
    res.json({ message: 'Journal Qantos API is running' });
});
// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/journal', require('./routes/journalRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState,
        lastError: lastDbError,
        env: process.env.MONGODB_URI ? 'Defined' : 'Missing'
    });
});


// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

