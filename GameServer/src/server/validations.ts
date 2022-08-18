import Events from './Events';
import GamePhases from './GamePhases';

export function validateEventOnGamePhase(eventTag: Events, currentPhase: GamePhases) {
  switch (eventTag) {
    case Events.PLAYER_JOINED:
      return currentPhase !== GamePhases.FINISHED;
    default:
      return false;
  }
}
