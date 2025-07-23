import winston from 'winston';

const createLogger = () => {
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'payment-api' },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ],
  });

  return logger;
};

export const logger = createLogger();

// Helper for structured logging with context
export const logWithContext = (level: string, message: string, context?: Record<string, any>) => {
  logger.log(level, message, { context });
};
