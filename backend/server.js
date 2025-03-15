const express = require('express');
const cors = require('cors');
const { connectRedis } = require('../config/redis');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const LoggerUtils = require('./utils/logger');

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for frontend/mobile access
app.use(rateLimiter); // Apply rate limiting to all routes

// Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Start server with Redis initialization
const startServer = async () => {
  try {
    // Initialize Redis (optional caching)
    await connectRedis();
    LoggerUtils.info('Redis connection established');

    // Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      LoggerUtils.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    LoggerUtils.error('Server startup failed', error);
    process.exit(1);
  }
};

// Global error handler (must be last)
app.use(errorHandler);
const paymentController = require('./controllers/paymentController');
app.post('/api/payments/create-order', paymentController.createOrder);
app.post('/api/payments/verify', paymentController.verifyPayment);
// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
  LoggerUtils.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  LoggerUtils.error('Unhandled rejection', reason);
  process.exit(1);
});

// Start the server
startServer();