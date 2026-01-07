const express = require('express');
const router = express.Router();
const { getUsers, createUser, getUserById, updateUser } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getUsers);
router.post('/', requireAuth, createUser);
router.get('/:id', requireAuth, getUserById);
router.put('/:id', requireAuth, updateUser);

module.exports = router;

