import {GameEventCode} from '../game/gameState';
import {IEnqueuedGameEvent} from '../server/handlers';
import argv from './argsClient';

export function getRandomChoice(numberOptions: number) {
  return Math.floor(Math.random() * (numberOptions));
}

export function createRandomGameEvent(playerId: number): IEnqueuedGameEvent {
  const choice = argv.sendBadEvents ? getRandomChoice(5) : getRandomChoice(4);
  switch (choice) {
    case 0:
      return {
        playerId,
        code: GameEventCode.TRIGGERED_ROULETTE,
        triggeredAt: Date.now(),
      };
    case 1:
      return {
        playerId,
        code: GameEventCode.CHANGED_ACTIVE_PIECE,
        newActivePiece: getRandomChoice(5),
      };
    case 2:
      return {
        playerId,
        code: GameEventCode.RELEASED_PIECE,
        pieceType: getRandomChoice(5),
      };
    case 3:
      return {
        playerId,
        code: GameEventCode.ACKNOWLEDGED_ROULETTE,
      };
    default:
      return {};
  }
}
