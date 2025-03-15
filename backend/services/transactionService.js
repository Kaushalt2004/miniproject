const { web3 } = require('../config/polygon');
const MyCoinABI = require('../abis/MyCoin.json');
const TransactionModel = require('../models/transaction');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(MyCoinABI, contractAddress);

class TransactionService {
  // Transfer tokens on Mumbai Testnet
  static async transferTokens(fromAddress, toAddress, amount, privateKey) {
    const tx = {
      from: fromAddress,
      to: contractAddress,
      gas: 200000,
      gasPrice: await web3.eth.getGasPrice(),
      data: contract.methods.transfer(toAddress, web3.utils.toWei(amount, 'ether')).encodeABI(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Save to Firestore
    const txData = await TransactionModel.create({
      from: fromAddress,
      to: toAddress,
      amount: web3.utils.toWei(amount, 'ether'),
      txHash: receipt.transactionHash,
      status: 'completed',
    });

    return { txHash: receipt.transactionHash, txId: txData.txId };
  }

  // Mint tokens (admin only)
  static async mintTokens(toAddress, amount, adminPrivateKey) {
    const tx = {
      from: process.env.ADMIN_WALLET_ADDRESS,
      to: contractAddress,
      gas: 200000,
      gasPrice: await web3.eth.getGasPrice(),
      data: contract.methods.mint(toAddress, web3.utils.toWei(amount, 'ether')).encodeABI(),
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, adminPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    // Save to Firestore
    const txData = await TransactionModel.create({
      from: process.env.ADMIN_WALLET_ADDRESS,
      to: toAddress,
      amount: web3.utils.toWei(amount, 'ether'),
      txHash: receipt.transactionHash,
      status: 'completed',
    });

    return { txHash: receipt.transactionHash, txId: txData.txId };
  }

  // Get transaction history
  static async getTransactionHistory(address, limit = 50) {
    return TransactionModel.getByAddress(address, limit);
  }
}

module.exports = TransactionService;