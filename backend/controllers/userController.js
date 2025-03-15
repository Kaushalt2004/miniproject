const admin = require('../config/firebase');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.user; // From auth middleware

    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const { displayName, walletAddress } = req.body;

    // Validate wallet address if provided
    if (walletAddress && !web3.utils.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }

    const userRef = admin.firestore().collection('users').doc(uid);
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (walletAddress) updateData.walletAddress = walletAddress;
    updateData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await userRef.update(updateData);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const { uid } = req.user;

    // Delete from Firebase Auth and Firestore
    await Promise.all([
      admin.auth().deleteUser(uid),
      admin.firestore().collection('users').doc(uid).delete(),
    ]);

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};