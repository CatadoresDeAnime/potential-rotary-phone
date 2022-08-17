import {Server} from 'socket.io';
import 'dotenv/config';
import Events from './server/Events';
import GamePhases from './server/GamePhases';
import {baseHandler, onPlayerJoined} from './server/handlers';
import {Player} from './server/types';
import logger from './utils/logger';

const port = Number(process.env.PORT);
const io = new Server(port);
const expectedPlayersTokens = new Set([
  'tokenPlayer1',
  'tokenPlayer2',
  'tokenPlayer3',
  'tokenPlayer4',
]);
const currentPlayers: Player[] = [];
const currentPhase = GamePhases.WAITING_FOR_PLAYERS;

io.on('connection', (socket) => {
  logger.info({
    message: 'New connection',
    connectionId: socket.id,
  });
  socket.on(Events.PLAYER_JOINED, (player, onResponse) => {
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOINED,
      currentPhase,
      data: player,
      expectedPlayersTokens,
      currentPlayers,
      onResponse,
      handler: onPlayerJoined,
    });
  });
});
