const express = require('express');
const { getUsers, getUsersById, updateUser } = require('./admin.users.controller');
const { authenticateAdmin, authorize } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticateAdmin, authorize('Admin'));

router.get('/', getUsers);
router.get('/:userId', getUsersById);
router.patch('/update-user/:userId', updateUser);
// The client routes (profile, profile-edit, profile-delete) will be merged in the top-level aggregator router

module.exports = router;
