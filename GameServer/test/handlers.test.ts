import MockedSocket from 'socket.io-mock';
import {Socket} from 'socket.io';
import {baseHandler, onPlayerJoined} from '../src/server/handlers';
import Events from '../src/server/Events';
import GamePhases from '../src/server/GamePhases';
import {Player} from '../src/server/types';

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
    const token = 'token123';
    const player = {token};
    const expectedPlayersTokens = new Set([token, 'token456']);
    const currentPlayers: Player[] = [];
    const onResponse = (result: boolean) => {
      expect(result).toBe(true);
    };
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOIN,
      currentPhase: GamePhases.WAITING_FOR_PLAYERS,
      data: player,
      expectedPlayersTokens,
      currentPlayers,
      onResponse,
      handler: onPlayerJoined,
    });
  });
  test('rejectEvent', () => {
    const token = 'token123';
    const player = {token};
    const expectedPlayersTokens = new Set([token, 'token456']);
    const currentPlayers: Player[] = [];
    const onResponse = (result: boolean) => {
      expect(result).toBe(false);
    };
    baseHandler({
      socket,
      eventTag: Events.PLAYER_JOIN,
      currentPhase: GamePhases.FINISHED,
      data: player,
      expectedPlayersTokens,
      currentPlayers,
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
    const token = 'token123';
    const player = {token};
    const expectedPlayersTokens = new Set([token]);
    const currentPlayers: Player[] = [];
    const onResponse = (result: boolean) => {
      expect(result).toBe(true);
    };
    onPlayerJoined({
      socket,
      data: player,
      expectedPlayersTokens,
      currentPlayers,
      onResponse,
    });
    expect(currentPlayers).toContainEqual(player);
  });
  test('rejectPlayer', () => {
    const token = 'token123';
    const player = {token};
    const expectedPlayersTokens = new Set([]);
    const currentPlayers: Player[] = [];
    const onResponse = (result: boolean) => {
      expect(result).toBe(false);
    };
    onPlayerJoined({
      socket,
      data: player,
      expectedPlayersTokens,
      currentPlayers,
      onResponse,
    });
    expect(currentPlayers).toHaveLength(0);
  });
});
