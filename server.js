const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../config/db'); // adjust path if inside /api

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('../routes/userRoutes'));
app.use('/api/journal', require('../routes/journalRoutes'));
app.use('/api/challenges', require('../routes/challengeRoutes'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Journal Qantos API is running' });
});

module.exports = app;