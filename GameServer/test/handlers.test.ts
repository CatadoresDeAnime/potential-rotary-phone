import MockedSocket from 'socket.io-mock';
import {Socket} from 'socket.io';
import {
  baseHandler, IHandlerContext, onPlayerJoined, onPlayerSentGameEvent,
} from '../src/server/handlers';
import Events from '../src/server/Events';
import {createDefaultEnqueuedGameEvent, createDefaultPlayer, createDefaultSession} from './utils';
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
    const handler = (ctx: IHandlerContext) => {
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
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
      session,
      onResponse,
    });
    const foundItems = session.currentPlayers.filter((item) => item.token === token);
    expect(foundItems).toHaveLength(1);
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
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
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
      session.gameHandler.addPlayer(createDefaultPlayer());
    }
    const onResponse = (result: boolean, code: ErrorCodes) => {
      expect(result).toBe(false);
      expect(code).toBe(ErrorCodes.PLAYER_NOT_JOINED);
    };
    onPlayerJoined({
      socket,
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
      session,
      onResponse,
    });
    expect(session.currentPlayers).toHaveLength(0);
  });

  test('rejectPlayer - missingData', () => {
    const session = createDefaultSession();
    const token = 'token123';
    const expectedPlayersTokens = new Set([token]);
    session.expectedPlayersTokens = expectedPlayersTokens;
    const onResponse = (result: boolean, code: ErrorCodes) => {
      expect(result).toBe(false);
      expect(code).toBe(ErrorCodes.MISSING_DATA);
    };
    onPlayerJoined({
      socket,
      data: {},
      session,
      onResponse,
    });
    expect(session.currentPlayers).toHaveLength(0);
  });

  test('acceptPlayer - reconnect', () => {
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
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
      session,
      onResponse,
    });
    onPlayerJoined({
      socket,
      data: {
        eventCode: Events.PLAYER_JOINED,
        ...player,
      },
      session,
      onResponse,
    });
    expect(session.currentPlayers).toHaveLength(1);
  });
});

describe('onPlayerSentGameEvent', () => {
  let socket: Socket;

  beforeEach(() => {
    socket = new MockedSocket();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('addEvent', () => {
    const event = createDefaultEnqueuedGameEvent();
    const session = createDefaultSession();
    const onResponse = (result: boolean) => {
      expect(result).toBe(true);
    };
    onPlayerSentGameEvent({
      data: {
        eventCode: Events.GAME_EVENT,
        ...event,
      },
      session,
      socket,
      onResponse,
    });
  });

  test('missingData', () => {
    const session = createDefaultSession();
    const onResponse = (result: boolean) => {
      expect(result).toBe(false);
    };
    onPlayerSentGameEvent({
      data: {},
      session,
      socket,
      onResponse,
    });
  });
});
