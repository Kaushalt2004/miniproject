const { web3 } = require('../config/polygon');
const WalletModel = require('../models/wallet');
const TransactionService = require('./transactionService');

class WalletService {
  // Create or update wallet in Firestore
  static async createWallet(uid, walletAddress) {
    const balance = await web3.eth.getBalance(walletAddress);
    return WalletModel.createOrUpdate(walletAddress, {
      uid,
      balance,
    });
  }

  // Get wallet balance from Mumbai Testnet
  static async getBalance(walletAddress) {
    const balance = await web3.eth.getBalance(walletAddress);
    return web3.utils.fromWei(balance, 'ether'); // Return in MATIC
  }

  // Get token balance from MyCoin contract
  static async getTokenBalance(walletAddress) {
    const MyCoinABI = require('../abis/MyCoin.json');
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const contract = new web3.eth.Contract(MyCoinABI, contractAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return web3.utils.fromWei(balance, 'ether'); // Return in MYC
  }

  // Get wallets by user UID
  static async getWalletsByUid(uid, limit = 10) {
    return WalletModel.getByUid(uid, limit);
  }

  // Sync wallet balance with blockchain
  static async syncWalletBalance(walletAddress) {
    const balance = await web3.eth.getBalance(walletAddress);
    const wallet = await WalletModel.getByAddress(walletAddress);
    if (wallet) {
      await WalletModel.createOrUpdate(walletAddress, {
        uid: wallet.uid,
        balance,
      });
    }
    return web3.utils.fromWei(balance, 'ether');
  }
}

module.exports = WalletService;