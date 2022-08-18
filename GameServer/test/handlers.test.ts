import MockedSocket from 'socket.io-mock';
import {Socket} from 'socket.io';
import {baseHandler, HandlerContext, onPlayerJoined} from '../src/server/handlers';
import Events from '../src/server/Events';
import {createDefaultPlayer, createDefaultSession} from './utils';
import GamePhases from '../src/server/GamePhases';
import ErrorCodes from '../src/server/ErrorCodes';

jest.mock('socket.io');

describe('baseHandler', () => {
  let socket: Socket;

  beforeEach(() => {
    socket = new MockedSocket();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('acceptEvent', () => {
    const session = createDefaultSession();
    const token = 'token123';
    const player = createDefaultPlayer();
    player.token = token;
    const expectedPlayersTokens = new Set([token, 'token456']);
    session.expectedPlayersTokens = expectedPlayersTokens;
    const onResponse = (result: boolean) => {
      expect(result).toBe(true);
    };
    const handler = (ctx: HandlerContext) => {
      ctx.onResponse(true, ErrorCodes.OK, '');
    };
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOINED,
      data: player,
      session,
      onResponse,
      handler,
    });
  });

  test('rejectEvent', () => {
    const session = createDefaultSession();
    session.currentPhase = GamePhases.FINISHED;
    const onResponse = (result: boolean) => {
      expect(result).toBe(false);
    };
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOINED,
      data: createDefaultPlayer(),
      session,
      onResponse,
      handler: onPlayerJoined,
    });
  });
});

describe('onPlayerJoined', () => {
  let socket: Socket;

  beforeEach(() => {
    socket = new MockedSocket();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('acceptPlayer', () => {
    const session = createDefaultSession();
    const token = 'token123';
    const player = createDefaultPlayer();
    player.token = token;
    const expectedPlayersTokens = new Set([token]);
    session.expectedPlayersTokens = expectedPlayersTokens;
    const onResponse = (result: boolean) => {
      expect(result).toBe(true);
    };
    onPlayerJoined({
      socket,
      data: player,
      session,
      onResponse,
    });
    expect(session.currentPlayers).toContainEqual(player);
  });

  test('rejectPlayer', () => {
    const session = createDefaultSession();
    const token = 'token123';
    const player = createDefaultPlayer();
    player.token = token;
    const expectedPlayersTokens = new Set([]);
    session.expectedPlayersTokens = expectedPlayersTokens;
    const onResponse = (result: boolean) => {
      expect(result).toBe(false);
    };
    onPlayerJoined({
      socket,
      data: player,
      session,
      onResponse,
    });
    expect(session.currentPlayers).toHaveLength(0);
  });

  test('rejectPlayer - gameFull', () => {
    const session = createDefaultSession();
    const token = 'token123';
    const player = createDefaultPlayer();
    player.token = token;
    const expectedPlayersTokens = new Set([token]);
    session.expectedPlayersTokens = expectedPlayersTokens;
    for (let i = 0; i < 4; i++) {
      session.gameHandler.addPlayer({token: '', name: ''});
    }
    const onResponse = (result: boolean, code: ErrorCodes) => {
      expect(result).toBe(false);
      expect(code).toBe(ErrorCodes.PLAYER_NOT_JOINED);
    };
    onPlayerJoined({
      socket,
      data: player,
      session,
      onResponse,
    });
    expect(session.currentPlayers).toHaveLength(0);
  });
});
