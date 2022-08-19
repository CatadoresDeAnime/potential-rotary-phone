import {Socket} from 'socket.io';
import logger from '../utils/logger';
import ErrorCodes from './ErrorCodes';
import Events from './Events';
import {IPlayer} from './types';
import SessionContext from './session';
import {validateEventOnGamePhase} from './validations';

export interface IConnectionRequest {
  name?: string;
  token?: string;
}

type EventData = IConnectionRequest;

export interface IOnResponse {
  (result: boolean, errorCode: ErrorCodes, description: string): void;
}

export interface IHandlerContext {
  socket: Socket,
  data: EventData,
  onResponse: IOnResponse,
  session: SessionContext,
}

export interface IBaseHandlerContext {
  socket: Socket,
  eventTag: Events,
  data: EventData,
  onResponse: IOnResponse,
  handler: (ctx: IHandlerContext) => void,
  session: SessionContext,
}

export function baseHandler({
  eventTag, data, session, onResponse, handler, socket,
}: IBaseHandlerContext) {
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
}: IHandlerContext) {
  if (data.token === undefined || data.name === undefined) {
    const errorDescription = 'Missing token or name';
    logger.error({
      message: 'Failed to join player to match',
      connectionId: socket.id,
      data,
      errorCode: ErrorCodes.MISSING_DATA,
      errorDescription,
    });
    onResponse(false, ErrorCodes.MISSING_DATA, errorDescription);
    socket.disconnect();
    return;
  }
  const player: IPlayer = {token: data.token, name: data.name, connectionId: socket.id};
  const sessionCtx = session;
  if (sessionCtx.expectedPlayersTokens.has(player.token)) {
    if (sessionCtx.currentPlayers.length === 0) {
      sessionCtx.waitingForPlayersInfo.firstPlayerConnectedAt = Date.now();
    }
    sessionCtx.currentPlayers = session
      .currentPlayers.filter((currPlayer: IPlayer) => {
        if (currPlayer.token === player.token) {
          player.id = currPlayer.id;
        }
        return currPlayer.token !== player.token;
      });
    if (player.id === undefined) {
      player.id = sessionCtx.gameHandler.addPlayer(player);
      player.connectionId = socket.id;
      if (player.id === -1) {
        const errorDescription = 'Game is already full';
        logger.error({
          message: 'Failed to join player to match',
          connectionId: socket.id,
          player,
          errorCode: ErrorCodes.PLAYER_NOT_JOINED,
          errorDescription,
        });
        onResponse(false, ErrorCodes.PLAYER_NOT_JOINED, errorDescription);
        socket.disconnect();
        return;
      }
    }
    sessionCtx.currentPlayers.push(player);
    logger.info({
      message: 'Player joined',
      connectionId: socket.id,
      player,
    });
    onResponse(true, ErrorCodes.OK, 'Joined game');
    socket.emit(Events.CONNECTION_ACCEPTED, player.id);
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
