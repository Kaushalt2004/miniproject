const rateLimit = require('express-rate-limit');

// Rate limiter middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers (e.g., X-RateLimit-Limit)
  legacyHeaders: false, // Disable older X-RateLimit headers
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
  },
  keyGenerator: (req) => {
    // Use IP or user ID (if authenticated) as the key
    return req.ip || (req.user && req.user.uid) || 'anonymous';
  },
});

module.exports = rateLimiter;