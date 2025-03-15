const admin = require('../config/firebase');
const { web3 } = require('../config/polygon');
const MyCoinABI = require('../abis/MyCoin.json');
require('dotenv').config();

const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(MyCoinABI, contractAddress);

// Transfer tokens
exports.transferTokens = async (req, res) => {
  try {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    if (!web3.utils.isAddress(fromAddress) || !web3.utils.isAddress(toAddress) || !amount) {
      return res.status(400).json({ error: 'Invalid addresses or amount' });
    }

    const tx = {
      from: fromAddress,
      to: process.env.CONTRACT_ADDRESS,
      gas: 200000,
      gasPrice: await web3.eth.getGasPrice(),
      data: contract.methods.transfer(toAddress, web3.utils.toWei(amount, 'ether')).encodeABI(),
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const batch = admin.firestore().batch();
    const txRef = admin.firestore().collection('transactions').doc();
    batch.set(txRef, {
      from: fromAddress,
      to: toAddress,
      amount,
      txHash: receipt.transactionHash,
      type: 'transfer',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    await batch.commit();

    res.json({ success: true, txHash: receipt.transactionHash });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const { address } = req.params;

    const snapshot = await admin.firestore().collection('transactions')
      .where('from', '==', address)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const transactions = snapshot.docs.map(doc => doc.data());
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};