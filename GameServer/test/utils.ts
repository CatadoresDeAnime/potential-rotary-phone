import GamePhases from '../src/server/GamePhases';
import {IPlayer} from '../src/server/types';
import SessionContext from '../src/server/session';
import GameHandler from '../src/game/GameHandler';
import {IEnqueuedGameEvent} from '../src/server/handlers';
import {GameEventCode} from '../src/game/gameState';

export function createDefaultSession(): SessionContext {
  return {
    waitingForPlayersInfo: {
      firstPlayerConnectedAt: 0,
      sessionStartedAt: Date.now(),
    },
    countdownInfo: {
      currentCount: 5,
      lastCountSentAt: 0,
    },
    expectedPlayersTokens: new Set([
      'tokenPlayer1',
      'tokenPlayer2',
      'tokenPlayer3',
      'tokenPlayer4',
    ]),
    currentPlayers: [],
    currentPhase: GamePhases.WAITING_FOR_PLAYERS,
    gameHandler: new GameHandler(),
  };
}

export function createDefaultPlayer(id = 1): IPlayer {
  return {
    token: `tokenPlayer${id}`,
    name: `player-${id}`,
    connectionId: `id-${id}`,
  };
}

export function createDefaultEnqueuedGameEvent(): IEnqueuedGameEvent {
  return {
    code: GameEventCode.RELEASED_PIECE,
    playerId: 0,
  };
}
