const admin = require('../config/firebase');

class TransactionModel {
  static collection = admin.firestore().collection('transactions');

  // Schema definition
  static schema = {
    txId: 'string',          // Firestore document ID (auto-generated)
    from: 'string',          // Sender's wallet address
    to: 'string',            // Receiver's wallet address
    amount: 'string',        // Amount in wei (string for precision)
    txHash: 'string',        // Polygon transaction hash
    timestamp: 'timestamp',  // Transaction timestamp
    status: 'string',        // 'pending', 'completed', 'failed'
  };

  // Create a transaction
  static async create(data) {
    try {
      const txData = {
        from: data.from,
        to: data.to,
        amount: data.amount,
        txHash: data.txHash,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: data.status || 'completed',
      };

      const docRef = this.collection.doc();
      await docRef.set(txData);
      return { txId: docRef.id, ...txData };
    } catch (error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  // Get transactions by address (sender or receiver)
  static async getByAddress(address, limit = 50) {
    try {
      const [fromSnapshot, toSnapshot] = await Promise.all([
        this.collection
          .where('from', '==', address)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get(),
        this.collection
          .where('to', '==', address)
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get(),
      ]);

      const transactions = [
        ...fromSnapshot.docs.map(doc => ({ txId: doc.id, ...doc.data() })),
        ...toSnapshot.docs.map(doc => ({ txId: doc.id, ...doc.data() })),
      ];

      // Sort combined results by timestamp
      return transactions.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()).slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  // Update transaction status
  static async updateStatus(txId, status) {
    try {
      await this.collection.doc(txId).update({
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }
}

module.exports = TransactionModel;