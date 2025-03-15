const admin = require('../config/firebase');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Signup with Firebase Auth
exports.signup = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Generate JWT token
    const token = jwt.sign({ uid: userRecord.uid, email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Store user data in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ uid: userRecord.uid, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login (client-side token verification assumed)
exports.login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Generate custom JWT
    const token = jwt.sign({ uid, email: decodedToken.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ uid, token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify JWT middleware
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};