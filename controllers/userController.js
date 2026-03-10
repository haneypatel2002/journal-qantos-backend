const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');

// Create or get user by name
const createUser = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Check if user already exists
        let user = await User.findOne({ name: name.trim() });
        if (user) {
            return res.json(user);
        }

        user = await User.create({ name: name.trim() });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user by ID
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get entry count
        const entryCount = await JournalEntry.countDocuments({ userId: user._id });

        // Get mood distribution
        const moodDistribution = await JournalEntry.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: '$mood', count: { $sum: 1 } } },
        ]);

        res.json({
            ...user.toObject(),
            entryCount,
            moodDistribution,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update streak
const updateStreak = async (userId, date) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const today = date;
        const lastEntry = user.lastEntryDate;

        if (!lastEntry) {
            user.streakCount = 1;
        } else {
            const lastDate = new Date(lastEntry);
            const currentDate = new Date(today);
            const diffTime = currentDate - lastDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                user.streakCount += 1;
            } else if (diffDays > 1) {
                user.streakCount = 1;
            }
        }

        user.lastEntryDate = today;
        await user.save();
    } catch (error) {
        console.error('Error updating streak:', error.message);
    }
};

// Update user profile
const updateUser = async (req, res) => {
    try {
        const { name } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name.trim();

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also delete journal entries
        await JournalEntry.deleteMany({ userId: user._id });

        res.json({ message: 'User and all data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createUser, getUser, updateStreak, updateUser, deleteUser };
