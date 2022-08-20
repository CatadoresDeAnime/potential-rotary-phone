import {Server} from 'socket.io';
import Events from './server/Events';
import GamePhases from './server/GamePhases';
import {baseHandler, onPlayerJoined, onPlayerSentGameEvent} from './server/handlers';
import logger from './utils/logger';
import Config from './server/Config';
import {
  manageCountdown,
  manageGameCreated,
  manageGameFinished,
  manageGameRunning,
  manageWaitingForPlayers,
} from './server/gameFlowManagers';
import argv from './utils/args';
import GameHandler from './game/GameHandler';

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
  gameHandler: new GameHandler(),
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
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
      onResponse,
      handler: onPlayerJoined,
    });
  });
  socket.on(Events.GAME_EVENT, (event, onResponse) => {
    baseHandler({
      socket,
      eventTag: Events.GAME_EVENT,
      session,
      data: {
        eventCode: Events.GAME_EVENT,
        ...event,
      },
      onResponse,
      handler: onPlayerSentGameEvent,
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
    case GamePhases.RUNNING:
      manageGameRunning(server, session);
      break;
    case GamePhases.FINISHED:
      manageGameFinished(server, session);
      process.exit();
      break;
    default:
      break;
  }
}, Config.updateTime);
