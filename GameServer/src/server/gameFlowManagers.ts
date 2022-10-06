import {Server} from 'socket.io';
import {GameRunningPhase} from '../game/gameState';
import logger from '../utils/logger';
import Config from './Config';
import Events from './Events';
import GamePhases from './GamePhases';
import sendGameStatics from './sendGameStatics';
import ISessionContext from './session';

export function manageGameCreated(server: Server, session: ISessionContext) {
  logger.info('Session created...');
  logger.info('Server started...');
  const sessionCtx = session;
  sessionCtx.currentPhase = GamePhases.WAITING_FOR_PLAYERS;
}

export function manageWaitingForPlayers(server: Server, session: ISessionContext) {
  const sessionCtx = session;
  if (sessionCtx.currentPlayers.length === sessionCtx.expectedPlayersTokens.size) {
    logger.info('Countdown started...');
    sessionCtx.currentPhase = GamePhases.COUNTDOWN;
  } else if (sessionCtx.currentPlayers.length > 0) {
    const currentWaitingTime = Date.now() - sessionCtx.waitingForPlayersInfo.firstPlayerConnectedAt;
    if (currentWaitingTime > Config.maxPlayersWaitingTime) {
      logger.warn('Max waiting time exceeded, will start game with current players');
      sessionCtx.currentPhase = GamePhases.COUNTDOWN;
    }
  } else {
    const currentWaitingTime = Date.now() - sessionCtx.waitingForPlayersInfo.sessionStartedAt;
    if (currentWaitingTime > Config.maxWaitingTime) {
      logger.warn('Max waiting time exceeded, will end session');
      sessionCtx.currentPhase = GamePhases.FINISHED;
    }
  }
}

export function manageCountdown(server: Server, session: ISessionContext) {
  const sessionCtx = session;
  if (sessionCtx.countdownInfo.lastCountSentAt === 0) {
    sessionCtx.countdownInfo.lastCountSentAt = Date.now();
  } else if (sessionCtx.countdownInfo.currentCount > 0) {
    const timeDifference = Date.now() - sessionCtx.countdownInfo.lastCountSentAt;
    if (timeDifference > 1000) {
      sessionCtx.countdownInfo.currentCount -= 1;
      server.emit(Events.COUNTDOWN, sessionCtx.countdownInfo.currentCount);
      sessionCtx.countdownInfo.lastCountSentAt = Date.now();
    }
  } else {
    logger.info('Starting game...');
    sessionCtx.currentPhase = GamePhases.RUNNING;
    sessionCtx.gameHandler.start();
  }
}

export function manageGameRunning(server: Server, session: ISessionContext) {
  const gameState = session.gameHandler.getState();
  const sessionCtx = session;
  if (gameState.gameInfo.phase === GameRunningPhase.FINISHED) {
    sessionCtx.currentPhase = GamePhases.FINISHED;
  } else {
    sessionCtx.gameHandler.update();
    if (Config.shouldEmitStateUpdates) {
      server.emit(Events.STATE_UPDATE, gameState);
    }
  }
}

export function manageGameFinished(server: Server, session: ISessionContext) {
  sendGameStatics();
  server.emit(Events.GAME_FINISHED);
}
