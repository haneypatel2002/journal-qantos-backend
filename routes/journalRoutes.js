const express = require('express');
const router = express.Router();
const {
    createEntry,
    getEntries,
    getEntryByDate,
    updateEntry,
    getMoodData,
} = require('../controllers/journalController');

// POST /api/journal - Create entry
router.post('/', createEntry);

// GET /api/journal/:userId - Get all entries
router.get('/:userId', getEntries);

// GET /api/journal/:userId/mood-data - Get mood data for graph
router.get('/:userId/mood-data', getMoodData);

// GET /api/journal/:userId/:date - Get entry by date
router.get('/:userId/:date', getEntryByDate);

// PUT /api/journal/:id - Update entry
router.put('/:id', updateEntry);

module.exports = router;
