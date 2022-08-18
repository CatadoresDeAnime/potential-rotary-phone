import logger from '../src/utils/logger';

logger.transports.forEach((item) => {
  const transport = item;
  transport.silent = true;
});
