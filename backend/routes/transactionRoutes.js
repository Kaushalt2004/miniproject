const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

// POST /api/transactions/transfer - Transfer tokens
router.post('/transfer', authController.verifyToken, async (req, res) => {
  await transactionController.transferTokens(req, res);
});

// GET /api/transactions/history/:address - Get transaction history
router.get('/history/:address', authController.verifyToken, async (req, res) => {
  await transactionController.getTransactionHistory(req, res);
});

module.exports = router;