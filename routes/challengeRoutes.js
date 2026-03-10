const express = require('express');
const router = express.Router();
const {
    getSuggestions,
    startChallenge,
    getChallenges,
    completeDay,
} = require('../controllers/challengeController');

// GET /api/challenges/suggestions/:userId - Get suggestions
router.get('/suggestions/:userId', getSuggestions);

// POST /api/challenges - Start a challenge
router.post('/', startChallenge);

// GET /api/challenges/:userId - Get user's challenges
router.get('/:userId', getChallenges);

// PUT /api/challenges/:id/day/:day - Complete a day
router.put('/:id/day/:day', completeDay);

module.exports = router;
