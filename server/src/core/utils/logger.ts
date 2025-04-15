import winston from 'winston';
import { env } from '@core/config/environment';

export const logger = winston.createLogger({
  level: env.isDevelopment() ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'mwap-api',
    environment: env.getEnvironmentName()
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});