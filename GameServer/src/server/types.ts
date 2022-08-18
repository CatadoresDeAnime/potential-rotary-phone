import GamePhases from './GamePhases';

export interface Player {
  token: string;
}

export interface WaitingForPlayers {
  firstPlayerConnectedAt: number;
  sessionStartedAt: number;
}

export interface SessionContext {
  waitingForPlayersInfo: WaitingForPlayers;
  expectedPlayersTokens: Set<string>;
  currentPlayers: Player[];
  currentPhase: GamePhases;
}
