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
    name: `player-${argv.token}`,
  };
  socket.on(Events.CONNECTION_ACCEPTED, (id) => {
    clientLogger.info(`Joined game with id: ${id}`);
  });
  socket.on(Events.COUNTDOWN, (count) => {
    clientLogger.info(`Countdown: ${count}`);
  });

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
