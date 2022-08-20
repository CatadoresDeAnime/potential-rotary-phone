import {Socket} from 'socket.io';
import Events from './Events';
import GamePhases from './GamePhases';
import ISessionContext from './session';

export function validateEventOnGamePhase(eventTag: Events, currentPhase: GamePhases) {
  switch (eventTag) {
    case Events.PLAYER_JOINED:
      return currentPhase !== GamePhases.FINISHED;
    case Events.GAME_EVENT:
      return currentPhase === GamePhases.RUNNING;
    default:
      return false;
  }
}

export function validatePlayer(socket: Socket, session: ISessionContext) {
  return session.currentPlayers.findIndex((player) => player.connectionId === socket.id) !== -1;
}
