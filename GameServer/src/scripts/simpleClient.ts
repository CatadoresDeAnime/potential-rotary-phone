import {io} from 'socket.io-client';
import Events from '../server/Events';
import ErrorCodes from '../server/ErrorCodes';
import argv from './argsClient';
import clientLogger from '../utils/clientLogger';

const {host} = argv;
const {port} = argv;
const socket = io(`${host}:${port}`);

socket.on('connect', () => {
  clientLogger.info('Client connected');
  const player = {
    token: argv.token,
  };

  socket.emit(
    Events.PLAYER_JOINED,
    player,
    (result: boolean, errorCode: ErrorCodes, message: string) => {
      if (result) {
        clientLogger.info('Player added to match');
      } else {
        clientLogger.error({
          message: 'Player not added to match',
          errorCode,
          errorDescription: message,
        });
      }
    },
  );
});
