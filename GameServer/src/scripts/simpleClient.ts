import {io} from 'socket.io-client';
import Events from '../server/Events';
import ErrorCodes from '../server/ErrorCodes';
import argv from './argsClient';
import clientLogger from '../utils/clientLogger';
import {createRandomGameEvent} from './utils';

const {host} = argv;
const {port} = argv;
const socket = io(`${host}:${port}`);

socket.on('connect', () => {
  clientLogger.info('Client connected');
  const player = {
    token: argv.token,
    name: `player-${argv.token}`,
    id: -1,
  };
  let lastStateLoggedAt = 0;

  socket.on(Events.CONNECTION_ACCEPTED, (id) => {
    clientLogger.info(`Joined game with id: ${id}`);
    player.id = id;
  });

  socket.on(Events.COUNTDOWN, (count) => {
    clientLogger.info(`Countdown: ${count}`);
  });

  socket.on(Events.STATE_UPDATE, (state) => {
    const timeDifference = Date.now() - lastStateLoggedAt;
    if (timeDifference > argv.stateLogRate) {
      const data = argv.logCompleteState ? state : state.gameInfo.phase;
      clientLogger.info({
        message: 'State update received',
        data,
      });
      lastStateLoggedAt = Date.now();
    }
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

  setInterval(() => {
    socket.emit(
      Events.GAME_EVENT,
      createRandomGameEvent(player.id),
      (result: boolean, errorCode: ErrorCodes, message: string) => {
        if (!result) {
          clientLogger.error({
            message: 'Error sending game event',
            errorCode,
            errorDescription: message,
          });
        }
      },
    );
  }, argv.sendEventsRate);
});
