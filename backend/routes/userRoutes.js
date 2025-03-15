const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// GET /api/users/profile - Get user profile
router.get('/profile', authController.verifyToken, async (req, res) => {
  await userController.getProfile(req, res);
});

// PUT /api/users/profile - Update user profile
router.put('/profile', authController.verifyToken, async (req, res) => {
  await userController.updateProfile(req, res);
});

// DELETE /api/users/account - Delete user account
router.delete('/account', authController.verifyToken, async (req, res) => {
  await userController.deleteAccount(req, res);
});

module.exports = router;