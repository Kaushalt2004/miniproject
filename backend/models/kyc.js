const admin = require('../config/firebase');

class KYCModel {
  static collection = admin.firestore().collection('kyc');

  // Schema definition
  static schema = {
    kycId: 'string',          // Firestore document ID (auto-generated)
    uid: 'string',            // Associated user UID
    fullName: 'string',       // Full name from KYC docs
    documentType: 'string',   // 'passport', 'id_card', 'driver_license'
    documentNumber: 'string', // Document number
    status: 'string',         // 'pending', 'verified', 'rejected'
    submittedAt: 'timestamp', // Submission timestamp
    verifiedAt: 'timestamp?', // Optional verification timestamp
  };

  // Submit KYC data
  static async submit(uid, data) {
    try {
      const kycData = {
        uid,
        fullName: data.fullName,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = this.collection.doc();
      await docRef.set(kycData);
      return { kycId: docRef.id, ...kycData };
    } catch (error) {
      throw new Error(`Failed to submit KYC: ${error.message}`);
    }
  }

  // Get KYC by UID
  static async getByUid(uid) {
    try {
      const snapshot = await this.collection
        .where('uid', '==', uid)
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return { kycId: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error(`Failed to get KYC: ${error.message}`);
    }
  }

  // Update KYC status
  static async updateStatus(kycId, status) {
    try {
      const updateData = {
        status,
        verifiedAt: status === 'verified' ? admin.firestore.FieldValue.serverTimestamp() : null,
      };

      await this.collection.doc(kycId).update(updateData);
      return { kycId, ...updateData };
    } catch (error) {
      throw new Error(`Failed to update KYC status: ${error.message}`);
    }
  }
}

module.exports = KYCModel;