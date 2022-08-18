import GameHandler from '../game/GameHandler';
import GamePhases from './GamePhases';
import {Player} from './types';

interface WaitingForPlayers {
  firstPlayerConnectedAt: number;
  sessionStartedAt: number;
}

interface CountdownInfo{
  currentCount: number;
  lastCountSentAt: number;
}

interface SessionContext {
  waitingForPlayersInfo: WaitingForPlayers;
  countdownInfo: CountdownInfo;
  expectedPlayersTokens: Set<string>;
  currentPlayers: Player[];
  currentPhase: GamePhases;
  gameHandler: GameHandler;
}

export default SessionContext;
