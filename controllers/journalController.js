const JournalEntry = require('../models/JournalEntry');
const { updateStreak } = require('./userController');

// Create journal entry
const createEntry = async (req, res) => {
    try {
        const { userId, date, mood, content } = req.body;

        // Check if entry already exists for this date
        const existing = await JournalEntry.findOne({ userId, date });
        if (existing) {
            // Update existing entry
            existing.mood = mood;
            existing.content = content;
            existing.timestamp = Date.now();
            await existing.save();
            await updateStreak(userId, date);
            return res.json(existing);
        }

        const entry = await JournalEntry.create({ userId, date, mood, content });
        await updateStreak(userId, date);
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all entries for user
const getEntries = async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.params.userId })
            .sort({ date: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get entry for specific date
const getEntryByDate = async (req, res) => {
    try {
        const entry = await JournalEntry.findOne({
            userId: req.params.userId,
            date: req.params.date,
        });
        res.json(entry || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update entry
const updateEntry = async (req, res) => {
    try {
        const entry = await JournalEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        const { mood, content } = req.body;
        if (mood) entry.mood = mood;
        if (content !== undefined) entry.content = content;
        entry.timestamp = Date.now();

        await entry.save();
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get mood data for graph (last N months)
const getMoodData = async (req, res) => {
    try {
        const { userId } = req.params;
        const months = parseInt(req.query.months) || 6;

        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const startDateStr = startDate.toISOString().split('T')[0];

        const entries = await JournalEntry.find({
            userId,
            date: { $gte: startDateStr },
        }).select('date mood').sort({ date: 1 });

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createEntry, getEntries, getEntryByDate, updateEntry, getMoodData };
