import {io} from 'socket.io-client';
import 'dotenv/config';
import logger from '../utils/logger';
import Events from '../server/Events';
import ErrorCodes from '../server/ErrorCodes';

const host = process.env.HOST;
const port = process.env.PORT;
const socket = io(`${host}:${port}`);

socket.on('connect', () => {
  logger.info('Client connected');
  const player = {
    token: 'tokenPlayer1',
  };

  socket.emit(
    Events.PLAYER_JOINED,
    player,
    (result: boolean, errorCode: ErrorCodes, message: string) => {
      if (result) {
        logger.info('Player added to match');
      } else {
        logger.error({
          message: 'Player not added to match',
          errorCode,
          errorDescription: message,
        });
      }
    },
  );
});
