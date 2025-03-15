const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup - Register a new user
router.post('/signup', async (req, res) => {
  await authController.signup(req, res);
});

// POST /api/auth/login - Login with Firebase ID token
router.post('/login', async (req, res) => {
  await authController.login(req, res);
});

module.exports = router;