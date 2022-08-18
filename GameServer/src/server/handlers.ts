import {Socket} from 'socket.io';
import logger from '../utils/logger';
import ErrorCodes from './ErrorCodes';
import Events from './Events';
import {Player, SessionContext} from './types';
import {validateEventOnGamePhase} from './validations';

type EventData = Player;

interface IOnResponse {
  (result: boolean, errorCode: ErrorCodes, description: string): void;
}

interface HandlerContext {
  socket: Socket,
  data: EventData,
  onResponse: IOnResponse,
  session: SessionContext,
}

interface BaseHandlerContext {
  socket: Socket,
  eventTag: Events,
  data: EventData,
  onResponse: IOnResponse,
  handler: (ctx: HandlerContext) => void,
  session: SessionContext,
}

export function baseHandler({
  eventTag, data, session, onResponse, handler, socket,
}: BaseHandlerContext) {
  if (validateEventOnGamePhase(eventTag, session.currentPhase)) {
    handler({
      data, session, onResponse, socket,
    });
  } else {
    const message = `Current game phase: ${session.currentPhase}`;
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
  data, session, onResponse, socket,
}: HandlerContext) {
  const player = data;
  const sessionCtx = session;
  if (sessionCtx.expectedPlayersTokens.has(player.token)) {
    if (sessionCtx.currentPlayers.length === 0) {
      sessionCtx.waitingForPlayersInfo.firstPlayerConnectedAt = Date.now();
    }
    sessionCtx.currentPlayers = session
      .currentPlayers.filter((currPlayer) => currPlayer.token !== player.token);
    sessionCtx.currentPlayers.push(player);
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
    socket.disconnect();
  }
}
