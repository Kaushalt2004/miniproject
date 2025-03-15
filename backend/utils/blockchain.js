const { web3 } = require('../config/polygon');
const MyCoinABI = require('../abis/MyCoin.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(MyCoinABI, contractAddress);

class BlockchainUtils {
  // Convert amount to wei
  static toWei(amount, unit = 'ether') {
    return web3.utils.toWei(amount.toString(), unit);
  }

  // Convert wei to ether
  static fromWei(amount, unit = 'ether') {
    return web3.utils.fromWei(amount.toString(), unit);
  }

  // Validate Ethereum/Polygon address
  static isValidAddress(address) {
    return web3.utils.isAddress(address);
  }

  // Estimate gas for a transaction
  static async estimateGas(txObject) {
    try {
      return await web3.eth.estimateGas(txObject);
    } catch (error) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }

  // Get current gas price
  static async getGasPrice() {
    return web3.eth.getGasPrice();
  }

  // Check MYC token balance
  static async getTokenBalance(address) {
    if (!this.isValidAddress(address)) throw new Error('Invalid address');
    const balance = await contract.methods.balanceOf(address).call();
    return this.fromWei(balance);
  }

  // Generate a new wallet (for testing)
  static generateWallet() {
    const account = web3.eth.accounts.create();
    return {
      address: account.address,
      privateKey: account.privateKey,
    };
  }
}

module.exports = BlockchainUtils;