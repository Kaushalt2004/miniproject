const admin = require('../config/firebase');

class WalletModel {
  static collection = admin.firestore().collection('wallets');

  // Schema definition
  static schema = {
    walletAddress: 'string',    // Polygon wallet address (primary key)
    uid: 'string',             // Associated user UID
    balance: 'string',         // Balance in wei (string for precision)
    createdAt: 'timestamp',    // Creation timestamp
    lastUpdated: 'timestamp',  // Last update timestamp
  };

  // Create or update wallet
  static async createOrUpdate(walletAddress, data) {
    try {
      const walletData = {
        walletAddress,
        uid: data.uid,
        balance: data.balance || '0',
        createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.collection.doc(walletAddress).set(walletData, { merge: true });
      return walletData;
    } catch (error) {
      throw new Error(`Failed to create/update wallet: ${error.message}`);
    }
  }

  // Get wallet by address
  static async getByAddress(walletAddress) {
    try {
      const doc = await this.collection.doc(walletAddress).get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (error) {
      throw new Error(`Failed to get wallet: ${error.message}`);
    }
  }

  // Get wallets by user UID
  static async getByUid(uid, limit = 10) {
    try {
      const snapshot = await this.collection
        .where('uid', '==', uid)
        .orderBy('lastUpdated', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      throw new Error(`Failed to get wallets by UID: ${error.message}`);
    }
  }
}

module.exports = WalletModel;