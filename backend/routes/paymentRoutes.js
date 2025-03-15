const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

// POST /api/payments/create-order - Create a payment order
router.post('/create-order', authController.verifyToken, async (req, res) => {
  await paymentController.createOrder(req, res);
});

// POST /api/payments/verify - Verify payment signature
router.post('/verify', authController.verifyToken, async (req, res) => {
  await paymentController.verifyPayment(req, res);
});

module.exports = router;