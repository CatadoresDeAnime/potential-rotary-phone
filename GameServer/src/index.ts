import {Server} from 'socket.io';
import 'dotenv/config';
import Events from './server/Events';
import GamePhases from './server/GamePhases';
import {baseHandler, onPlayerJoined} from './server/handlers';
import logger from './utils/logger';
import Config from './server/Config';
import {manageWaitingForPlayers} from './server/gameFlowManagers';
import argv from './utils/args';

const port = Number(argv.port);
const server = new Server(port);
const tokenList = argv.tokens || '';
const session = {
  waitingForPlayersInfo: {
    firstPlayerConnectedAt: 0,
    sessionStartedAt: Date.now(),
  },
  expectedPlayersTokens: new Set(tokenList.split(',')),
  currentPlayers: [],
  currentPhase: GamePhases.WAITING_FOR_PLAYERS,
};

server.on('connection', (socket) => {
  logger.info({
    message: 'New connection',
    connectionId: socket.id,
  });
  socket.on(Events.PLAYER_JOINED, (player, onResponse) => {
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOINED,
      session,
      data: player,
      onResponse,
      handler: onPlayerJoined,
    });
  });
});

setInterval(() => {
  switch (session.currentPhase) {
    case GamePhases.WAITING_FOR_PLAYERS:
      manageWaitingForPlayers(server, session);
      break;
    default:
      break;
  }
}, Config.updateTime);
