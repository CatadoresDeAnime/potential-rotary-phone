import {Server} from 'socket.io';
import 'dotenv/config';
import Events from './server/Events';
import GamePhases from './server/GamePhases';
import {baseHandler, onPlayerJoined} from './server/handlers';
import logger from './utils/logger';
import Config from './server/Config';
import {manageCountdown, manageGameCreated, manageWaitingForPlayers} from './server/gameFlowManagers';
import argv from './utils/args';

const port = Number(argv.port);
const server = new Server(port);
const tokenList = argv.tokens || '';
const session = {
  waitingForPlayersInfo: {
    firstPlayerConnectedAt: 0,
    sessionStartedAt: Date.now(),
  },
  countdownInfo: {
    currentCount: 6,
    lastCountSentAt: 0,
  },
  expectedPlayersTokens: new Set(tokenList.split(',')),
  currentPlayers: [],
  currentPhase: GamePhases.GAME_CREATED,
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
    case GamePhases.GAME_CREATED:
      manageGameCreated(server, session);
      break;
    case GamePhases.WAITING_FOR_PLAYERS:
      manageWaitingForPlayers(server, session);
      break;
    case GamePhases.COUNTDOWN:
      manageCountdown(server, session);
      break;
    default:
      break;
  }
}, Config.updateTime);
