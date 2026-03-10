const mongoose = require('mongoose');

const dayProgressSchema = new mongoose.Schema({
    day: { type: Number, required: true },
    task: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    scratched: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
}, { _id: false });

const challengeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['feel_better', 'focus', 'self_improvement', 'meditation', 'productivity'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    startDate: {
        type: String,
        required: true,
    },
    progress: {
        type: [dayProgressSchema],
        default: () => Array.from({ length: 21 }, (_, i) => ({
            day: i + 1,
            task: '',
            completed: false,
            scratched: false,
            completedAt: null,
        })),
    },
    completedDays: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Challenge', challengeSchema);
