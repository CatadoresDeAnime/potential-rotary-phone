import {createLogger, format, transports} from 'winston';

const clientLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.errors({stack: true}),
    format.splat(),
    format.json(),
  ),
  defaultMeta: {service: 'aqua-GameServer'},
  transports: [new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }),
  ],
});

export default clientLogger;
