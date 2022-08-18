import {createLogger, format, transports} from 'winston';
import 'dotenv';

const [dateString] = new Date().toISOString().split('T');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.errors({stack: true}),
    format.splat(),
    format.json(),
  ),
  defaultMeta: {service: 'aqua-GameServer'},
  transports: [
    new transports.File({filename: `logs/info-${dateString}.log`}),
    new transports.File({filename: `logs/errors-${dateString}.log`, level: 'error'}),
  ],
});

if (process.env.nodeEnv !== 'PRODUCTION') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }));
}

export default logger;
