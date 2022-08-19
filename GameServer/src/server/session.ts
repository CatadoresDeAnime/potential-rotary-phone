import GameHandler from '../game/GameHandler';
import GamePhases from './GamePhases';
import {Player} from './types';

interface IWaitingForPlayers {
  firstPlayerConnectedAt: number;
  sessionStartedAt: number;
}

interface ICountdownInfo{
  currentCount: number;
  lastCountSentAt: number;
}

interface ISessionContext {
  waitingForPlayersInfo: IWaitingForPlayers;
  countdownInfo: ICountdownInfo;
  expectedPlayersTokens: Set<string>;
  currentPlayers: Player[];
  currentPhase: GamePhases;
  gameHandler: GameHandler;
}

export default ISessionContext;
