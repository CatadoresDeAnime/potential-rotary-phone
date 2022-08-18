import GamePhases from '../src/server/GamePhases';
import {Player, SessionContext} from '../src/server/types';

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
  };
}

export function createDefaultPlayer(id = 1): Player {
  return {
    token: `tokenPlayer${id}`,
  };
}
