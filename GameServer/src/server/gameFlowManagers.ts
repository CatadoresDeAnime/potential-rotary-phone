import {Server} from 'socket.io';
import logger from '../utils/logger';
import Config from './Config';
import GamePhases from './GamePhases';
import {SessionContext} from './types';

export function manageWaitingForPlayers(server: Server, session: SessionContext) {
  const sessionCtx = session;
  if (sessionCtx.currentPlayers.length === sessionCtx.expectedPlayersTokens.size) {
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
