import {
  EventCode, GamePhase, MessageType, PieceType,
} from '@danielmontes/darkness/build/game/types';

export {EventCode as GameEventCode};

export {PieceType as GamePieceType};

export {GamePhase as GameRunningPhase};

export interface IStatePiece {
  type: PieceType;
  quantity: number;
  isActive: boolean;
}

export interface IStateMessage {
  content: string;
  type: MessageType;
}

export interface IStatePlayer {
  message?: IStateMessage;
  id: number;
  name: string;
  score: number;
  hand: IStatePiece[];
  isDead: boolean;
}

export interface IStateVector2 {
  x: number;
  y: number;
}

export interface IStateArrow {
  angle: number;
}

export interface IStateBalls {
  type: PieceType;
  position: IStateVector2;
}

export interface IStateCell {
  health: number;
}

export interface IStateMatrix {
  rows: number;
  cols: number;
  matrix: IStateCell[][];
}

export interface IStateBoard {
  matrix: IStateMatrix;
  balls: IStateBalls[][];
  arrows: IStateArrow[];
}

export interface IStateGameInfo {
  beginTime: number;
  endTime: number;
  phase: GamePhase;
}

export interface IState {
  players: IStatePlayer[];
  gameInfo: IStateGameInfo;
  board: IStateBoard;
  rouletteOptions: string[][];
  rouletteSelectedOptions: number[];
}
