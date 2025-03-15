const crypto = require('crypto');
require('dotenv').config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // 32 bytes
const IV_LENGTH = 16; // AES IV length

class EncryptionUtils {
  // Encrypt text (e.g., private keys)
  static encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  // Decrypt text
  static decrypt(encryptedText) {
    const [iv, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Hash data (e.g., for signatures)
  static hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate HMAC (used in Razorpay verification)
  static generateHMAC(data, secret = process.env.RAZORPAY_TEST_KEY_SECRET) {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }
}

module.exports = EncryptionUtils;