const Razorpay = require('razorpay');
const { web3 } = require('../config/polygon');
const MyCoinABI = require('../abis/MyCoin.json');
const EncryptionUtils = require('../utils/encryption');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_KEY_SECRET,
});
const contract = new web3.eth.Contract(MyCoinABI, process.env.CONTRACT_ADDRESS);

exports.createOrder = async (req, res) => {
  try {
    const { amount, walletAddress } = req.body; // Amount in INR
    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    res.json({ orderId: order.id, amount: options.amount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, orderId, signature, walletAddress, amount } = req.body;
    const crypto = require('crypto');
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_TEST_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Mint tokens based on payment (e.g., 1 INR = 1 MYC)
    const tokenAmount = web3.utils.toWei(amount.toString(), 'ether');
    const adminPrivateKey = EncryptionUtils.decrypt(process.env.ENCRYPTED_ADMIN_PRIVATE_KEY);
    const tx = {
      from: process.env.ADMIN_WALLET_ADDRESS,
      to: process.env.CONTRACT_ADDRESS,
      gas: 200000,
      gasPrice: await web3.eth.getGasPrice(),
      data: contract.methods.mint(walletAddress, tokenAmount).encodeABI(),
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, adminPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    await admin.firestore().collection('transactions').doc().set({
      from: process.env.ADMIN_WALLET_ADDRESS,
      to: walletAddress,
      amount,
      txHash: receipt.transactionHash,
      type: 'purchase',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, txHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};