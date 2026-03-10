const express = require('express');
const router = express.Router();
const { createUser, getUser, updateUser, deleteUser } = require('../controllers/userController');

// POST /api/users - Create or get user
router.post('/', createUser);

// GET /api/users/:id - Get user profile
router.get('/:id', getUser);

// PATCH /api/users/:id - Update user profile
router.patch('/:id', updateUser);

// DELETE /api/users/:id - Delete user account
router.delete('/:id', deleteUser);

module.exports = router;
