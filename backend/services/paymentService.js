const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const TransactionService = require('./transactionService');

class PaymentService {
  // Create a test mode payment order
  static async createOrder(amount) {
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return { orderId: order.id, amount: order.amount, currency: order.currency };
  }

  // Verify payment and mint tokens on Mumbai Testnet
  static async verifyAndMintPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature, userAddress, tokenAmount }) {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    // Mint tokens after successful verification (test mode)
    const { txHash } = await TransactionService.mintTokens(
      userAddress,
      tokenAmount,
      process.env.ADMIN_PRIVATE_KEY // Admin key for minting
    );

    return { success: true, txHash };
  }
}

module.exports = PaymentService;