const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');

// GET /api/users - Get all users
router.get('/', getUsers);

// POST /api/users - Create or get user
router.post('/', createUser);

// GET /api/users/:id - Get user profile
router.get('/:id', getUser);

// PATCH /api/users/:id - Update user profile
router.patch('/:id', updateUser);

// DELETE /api/users/:id - Delete user account
router.delete('/:id', deleteUser);

module.exports = router;

