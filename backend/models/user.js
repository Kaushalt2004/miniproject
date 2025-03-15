const admin = require('../config/firebase');

class UserModel {
  static collection = admin.firestore().collection('users');

  // Schema definition (not enforced by Firestore, but documented here)
  static schema = {
    uid: 'string',              // Firebase UID (primary key)
    email: 'string',            // User's email
    displayName: 'string',      // User's display name
    walletAddress: 'string?',   // Optional wallet address (Polygon)
    createdAt: 'timestamp',     // Creation timestamp
    updatedAt: 'timestamp?',    // Optional update timestamp
    kycStatus: 'string?',       // 'pending', 'verified', 'rejected' (optional)
  };

  // Create or update user
  static async createOrUpdate(uid, data) {
    try {
      const userData = {
        uid,
        email: data.email,
        displayName: data.displayName || '',
        walletAddress: data.walletAddress || null,
        createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        kycStatus: data.kycStatus || 'pending',
      };

      await this.collection.doc(uid).set(userData, { merge: true });
      return userData;
    } catch (error) {
      throw new Error(`Failed to create/update user: ${error.message}`);
    }
  }

  // Get user by UID
  static async getByUid(uid) {
    try {
      const doc = await this.collection.doc(uid).get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const snapshot = await this.collection.where('email', '==', email).limit(1).get();
      if (snapshot.empty) return null;
      return snapshot.docs[0].data();
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
  }
}

module.exports = UserModel;