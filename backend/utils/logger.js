const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log to console
    new winston.transports.File({ filename: 'logs/app.log' }), // Log to file
  ],
});

class LoggerUtils {
  static info(message) {
    logger.info(message);
  }

  static warn(message) {
    logger.warn(message);
  }

  static error(message, error) {
    logger.error(`${message}${error ? `: ${error.stack || error.message}` : ''}`);
  }

  static debug(message) {
    logger.debug(message);
  }
}

module.exports = LoggerUtils;