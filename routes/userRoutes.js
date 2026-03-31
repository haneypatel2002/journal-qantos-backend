const express = require('express');
const router = express.Router();
const { createUser, getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:id', getUser);

router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

