import GamePhases from './GamePhases';

export interface Player {
  token: string;
}

export interface WaitingForPlayers {
  firstPlayerConnectedAt: number;
  sessionStartedAt: number;
}

export interface CountdownInfo{
  currentCount: number;
  lastCountSentAt: number;
}

export interface SessionContext {
  waitingForPlayersInfo: WaitingForPlayers;
  countdownInfo: CountdownInfo;
  expectedPlayersTokens: Set<string>;
  currentPlayers: Player[];
  currentPhase: GamePhases;
}
