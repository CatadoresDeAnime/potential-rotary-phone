import {Socket} from 'socket.io';
import logger from '../utils/logger';
import ErrorCodes from './ErrorCodes';
import Events from './Events';
import GamePhases from './GamePhases';
import {Player} from './types';
import {validateEventOnGamePhase} from './validations';

type EventData = Player;

interface IOnResponse {
  (result: boolean, errorCode: ErrorCodes, description: string): void;
}

interface HandlerContext {
  socket: Socket,
  data: EventData,
  expectedPlayersTokens: Set<string>,
  currentPlayers: Player[],
  onResponse: IOnResponse,
}

interface BaseHandlerContext {
  socket: Socket,
  eventTag: Events,
  currentPhase: GamePhases,
  data: EventData,
  expectedPlayersTokens: Set<string>,
  currentPlayers: Player[],
  onResponse: IOnResponse,
  handler: (ctx: HandlerContext) => void,
}

export function baseHandler({
  eventTag, currentPhase, data, expectedPlayersTokens, currentPlayers, onResponse, handler, socket,
}: BaseHandlerContext) {
  if (validateEventOnGamePhase(eventTag, currentPhase)) {
    handler({
      data, expectedPlayersTokens, currentPlayers, onResponse, socket,
    });
  } else {
    const message = `Current game phase: ${currentPhase}`;
    logger.info({
      message: 'Event ignored',
      connectionId: socket.id,
      data,
      errorCode: ErrorCodes.EVENT_IGNORED,
      errorDescription: message,
    });
    onResponse(false, ErrorCodes.EVENT_IGNORED, message);
  }
}

export function onPlayerJoined({
  data, expectedPlayersTokens, currentPlayers, onResponse, socket,
}: HandlerContext) {
  const player = data;
  if (expectedPlayersTokens.has(player.token)) {
    currentPlayers.push(player);
    logger.info({
      message: 'Player joined',
      connectionId: socket.id,
      player,
    });
    onResponse(true, ErrorCodes.OK, 'Joined game');
  } else {
    const message = 'Invalid token';
    logger.info({
      message: 'Player not joined to match',
      connectionId: socket.id,
      player,
      errorCode: ErrorCodes.UNAUTHORIZED,
      errorDescription: message,
    });
    onResponse(false, ErrorCodes.UNAUTHORIZED, message);
  }
}
