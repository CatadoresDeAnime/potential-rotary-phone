import GameHandler from '../game/GameHandler';
import GamePhases from './GamePhases';
import {IPlayer} from './types';

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
  currentPlayers: IPlayer[];
  currentPhase: GamePhases;
  gameHandler: GameHandler;
}

export default ISessionContext;
