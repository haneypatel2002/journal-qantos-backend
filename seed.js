const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const JournalEntry = require('./models/JournalEntry');
const Challenge = require('./models/Challenge');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await JournalEntry.deleteMany({});
        await Challenge.deleteMany({});

        // Create a test user
        const user = await User.create({
            name: 'Test Explorer',
            streakCount: 5,
            lastEntryDate: new Date().toISOString().split('T')[0],
        });

        // Create some journal entries for the past week
        const moods = ['happy', 'calm', 'neutral', 'sad', 'angry', 'anxious'];
        const entries = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            entries.push({
                userId: user._id,
                date: dateStr,
                mood: moods[i % moods.length],
                content: `Day ${i} of my journaling journey. Feeling ${moods[i % moods.length]} today.`,
            });
        }
        await JournalEntry.insertMany(entries);

        // Create an active challenge
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 3); // 3 days ago

        await Challenge.create({
            userId: user._id,
            category: 'focus',
            title: 'Focus Challenge',
            description: 'Sharpen your concentration and eliminate distractions in 21 days.',
            startDate: startDate.toISOString().split('T')[0],
            completedDays: 2,
            progress: Array.from({ length: 21 }, (_, i) => ({
                day: i + 1,
                task: `Focus Task ${i + 1}`,
                completed: i < 2,
                scratched: i < 2,
                completedAt: i < 2 ? new Date() : null,
            })),
            status: 'active',
        });

        console.log('Seed data created successfully! 🌱');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
