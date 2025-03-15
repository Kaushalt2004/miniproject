const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const provider = new HDWalletProvider({
  mnemonic: { phrase: process.env.MNEMONIC },
  providerOrUrl: process.env.POLYGON_TESTNET_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  pollingInterval: 10000,
  chainId: 80001,
});

const web3 = new Web3(provider);

// Test connection
web3.eth.getBlockNumber()
  .then(block => console.log('Connected! Latest block:', block))
  .catch(err => console.error('Connection failed:', err));

process.on('SIGTERM', () => provider.engine.stop());
process.on('SIGINT', () => provider.engine.stop());

module.exports = { web3, provider };