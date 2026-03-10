const Challenge = require('../models/Challenge');
const JournalEntry = require('../models/JournalEntry');

// Challenge templates
const CHALLENGE_TEMPLATES = {
    feel_better: {
        title: 'Feel Better Challenge',
        description: 'A 21-day journey to lift your spirits and build emotional resilience.',
        tasks: [
            'Write 3 things you are grateful for',
            'Take a 15-minute walk outside',
            'Call or text a friend you haven\'t spoken to',
            'Listen to your favorite uplifting song',
            'Do something kind for a stranger',
            'Write a letter to your future self',
            'Try a new healthy recipe',
            'Spend 10 minutes in nature',
            'Watch a comedy or funny video',
            'Declutter one area of your space',
            'Practice deep breathing for 5 minutes',
            'Write down your achievements this week',
            'Try a creative activity (drawing, painting)',
            'Give yourself a compliment in the mirror',
            'Take a relaxing bath or shower',
            'Read an inspiring article or book chapter',
            'Do a random act of kindness',
            'Plan something fun for the weekend',
            'Write about a happy memory',
            'Stretch for 10 minutes',
            'Celebrate your 21-day progress!',
        ],
    },
    focus: {
        title: 'Focus Challenge',
        description: 'Sharpen your concentration and eliminate distractions in 21 days.',
        tasks: [
            'Set 3 clear goals for today',
            'Try the Pomodoro technique (25 min focus)',
            'Turn off phone notifications for 1 hour',
            'Organize your workspace',
            'Read for 20 minutes without distractions',
            'Practice single-tasking for 1 hour',
            'Write a to-do list the night before',
            'Meditate for 10 minutes',
            'Limit social media to 30 minutes today',
            'Complete your hardest task first',
            'Take a digital detox for 2 hours',
            'Practice mindful eating at one meal',
            'Set a timer and work without breaks for 30 min',
            'Review and prioritize your weekly goals',
            'Try a brain training exercise',
            'Write in a focus journal for 5 minutes',
            'Practice deep work for 1 hour',
            'Eliminate one daily distraction',
            'Do a puzzle or logic game',
            'Plan tomorrow\'s schedule in detail',
            'Reflect on your focus journey!',
        ],
    },
    self_improvement: {
        title: 'Self Improvement Challenge',
        description: 'Transform yourself with daily growth activities over 21 days.',
        tasks: [
            'Read 10 pages of a self-help book',
            'Write your personal mission statement',
            'Learn a new word and use it today',
            'Practice a new skill for 15 minutes',
            'Set a 30-day goal',
            'Listen to an educational podcast',
            'Write about your strengths',
            'Step outside your comfort zone today',
            'Track your daily habits',
            'Learn something new online',
            'Write about areas you want to improve',
            'Practice public speaking for 5 minutes',
            'Network with someone new',
            'Review your monthly budget',
            'Take an online course lesson',
            'Write a book review',
            'Teach someone something you know',
            'Practice time management today',
            'Set boundaries in one area of life',
            'Create a vision board',
            'Celebrate your growth journey!',
        ],
    },
    meditation: {
        title: 'Meditation Challenge',
        description: 'Build a peaceful meditation practice over 21 days.',
        tasks: [
            'Sit in silence for 5 minutes',
            'Try guided meditation for 10 minutes',
            'Practice body scan meditation',
            'Focus on your breath for 5 minutes',
            'Try walking meditation',
            'Practice loving-kindness meditation',
            'Meditate before bed tonight',
            'Try meditation with calming music',
            'Practice mindful observation',
            'Do a gratitude meditation',
            'Try a mantra meditation',
            'Meditate in nature',
            'Practice visualization meditation',
            'Try progressive muscle relaxation',
            'Do a morning meditation',
            'Practice compassion meditation',
            'Try a meditation app session',
            'Meditate for 15 minutes today',
            'Practice mindful listening',
            'Try candle gazing meditation',
            'Celebrate 21 days of mindfulness!',
        ],
    },
    productivity: {
        title: 'Productivity Boost Challenge',
        description: 'Supercharge your productivity with daily actionable tasks.',
        tasks: [
            'Plan your day using time blocks',
            'Complete 3 tasks before noon',
            'Batch similar tasks together',
            'Set up an email processing routine',
            'Use the 2-minute rule all day',
            'Create a morning routine',
            'Automate one repetitive task',
            'Clear your inbox to zero',
            'Set up a weekly review system',
            'Delegate or eliminate one task',
            'Create templates for repeated work',
            'Practice saying no to one thing',
            'Set up a filing system',
            'Track your time for the day',
            'Create a shutdown routine',
            'Minimize meeting time today',
            'Use keyboard shortcuts all day',
            'Batch your communication times',
            'Review and optimize your tools',
            'Plan your next week in advance',
            'Review your productivity journey!',
        ],
    },
};

// Get challenge suggestions based on mood
const getSuggestions = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get recent mood data (last 14 days)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const startDateStr = twoWeeksAgo.toISOString().split('T')[0];

        const entries = await JournalEntry.find({
            userId,
            date: { $gte: startDateStr },
        }).select('mood');

        // Count moods
        const moodCounts = { happy: 0, calm: 0, neutral: 0, sad: 0, angry: 0, anxious: 0 };
        entries.forEach((e) => {
            if (moodCounts[e.mood] !== undefined) moodCounts[e.mood]++;
        });

        const totalEntries = entries.length;
        const suggestions = [];

        // Rule-based suggestions
        const negativeMoods = moodCounts.sad + moodCounts.angry + moodCounts.anxious;
        const positiveMoods = moodCounts.happy + moodCounts.calm;

        if (negativeMoods > totalEntries * 0.4 || moodCounts.sad > 3) {
            suggestions.push({
                category: 'feel_better',
                ...CHALLENGE_TEMPLATES.feel_better,
                priority: 'high',
            });
        }

        if (moodCounts.anxious > 2 || negativeMoods > 3) {
            suggestions.push({
                category: 'meditation',
                ...CHALLENGE_TEMPLATES.meditation,
                priority: 'high',
            });
        }

        suggestions.push({
            category: 'focus',
            ...CHALLENGE_TEMPLATES.focus,
            priority: negativeMoods > positiveMoods ? 'medium' : 'low',
        });

        suggestions.push({
            category: 'self_improvement',
            ...CHALLENGE_TEMPLATES.self_improvement,
            priority: 'medium',
        });

        suggestions.push({
            category: 'productivity',
            ...CHALLENGE_TEMPLATES.productivity,
            priority: 'low',
        });

        // Remove duplicates
        const seen = new Set();
        const uniqueSuggestions = suggestions.filter((s) => {
            if (seen.has(s.category)) return false;
            seen.add(s.category);
            return true;
        });

        res.json(uniqueSuggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start a challenge
const startChallenge = async (req, res) => {
    try {
        const { userId, category } = req.body;

        // Check for active challenge
        const activeChallenge = await Challenge.findOne({ userId, status: 'active' });
        if (activeChallenge) {
            return res.status(400).json({
                message: 'You already have an active challenge. Complete or abandon it first.',
            });
        }

        const template = CHALLENGE_TEMPLATES[category];
        if (!template) {
            return res.status(400).json({ message: 'Invalid challenge category' });
        }

        const today = new Date().toISOString().split('T')[0];
        const progress = template.tasks.map((task, i) => ({
            day: i + 1,
            task,
            completed: false,
            scratched: false,
            completedAt: null,
        }));

        const challenge = await Challenge.create({
            userId,
            category,
            title: template.title,
            description: template.description,
            startDate: today,
            progress,
        });

        res.status(201).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's challenges
const getChallenges = async (req, res) => {
    try {
        const challenges = await Challenge.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Scratch and complete a day
const completeDay = async (req, res) => {
    try {
        const { id, day } = req.params;
        const { note } = req.body;
        const dayNum = parseInt(day);

        const challenge = await Challenge.findById(id);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Validate day number
        if (dayNum < 1 || dayNum > 21) {
            return res.status(400).json({ message: 'Invalid day number' });
        }

        // Check if day is unlockable (sequential or within date range)
        const startDate = new Date(challenge.startDate + 'T00:00:00');
        const todayAtMidnight = new Date();
        todayAtMidnight.setHours(0, 0, 0, 0);
        const daysSinceStart = Math.floor((todayAtMidnight - startDate) / (1000 * 60 * 60 * 24));

        if (dayNum > daysSinceStart + 1) {
            return res.status(400).json({ message: 'This day is not yet unlocked' });
        }

        // Update the day
        const dayIndex = dayNum - 1;
        challenge.progress[dayIndex].scratched = true;
        challenge.progress[dayIndex].completed = true;
        challenge.progress[dayIndex].completedAt = new Date();

        // Update completed count
        challenge.completedDays = challenge.progress.filter((d) => d.completed).length;

        // Check if challenge is complete
        if (challenge.completedDays === 21) {
            challenge.status = 'completed';
        }

        await challenge.save();

        // Automatically create/update a Journal Entry for this challenge completion
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            let entry = await JournalEntry.findOne({ userId: challenge.userId, date: todayStr });
            const taskName = challenge.progress[dayIndex].task;
            const taskHeader = `\n🏆 Challenge: ${challenge.title} (Day ${dayNum})`;
            const taskDetail = note ? `\nReflection: ${note}` : `\n✅ Completed Task: ${taskName}`;

            if (entry) {
                // Prevent duplicate task logging if they click multiple times (though button is disabled)
                if (!entry.content.includes(taskName) || (note && !entry.content.includes(note))) {
                    entry.content += `\n${taskHeader}${taskDetail}`;
                    await entry.save();
                }
            } else {
                // Create a new entry if none exists for today
                await JournalEntry.create({
                    userId: challenge.userId,
                    date: todayStr,
                    mood: 'happy', // If you finish a challenge, you're usually happy!
                    content: `Completed a challenge milestone today!${taskHeader}${taskDetail}`,
                });
            }
        } catch (journalErr) {
            console.error('Failed to link challenge to journal:', journalErr);
        }

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSuggestions, startChallenge, getChallenges, completeDay };
