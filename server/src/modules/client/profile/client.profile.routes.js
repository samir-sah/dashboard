const express = require('express');
const { getProfile, updateCustomerInfo, profileDelete, deleteAddress, addAddress } = require('./client.profile.controller');
const { authenticate } = require('../../../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile-edit', authenticate, updateCustomerInfo);
router.post('/add-address', authenticate, addAddress);
router.delete('/profile-delete', authenticate, profileDelete);
router.delete('/address-delete/:addressId', authenticate, deleteAddress);
module.exports = router;
