import {Socket} from 'socket.io';
import MockedSocket from 'socket.io-mock';
import {validatePlayer} from '../src/server/validations';
import {createDefaultPlayer, createDefaultSession} from './utils';

jest.mock('socket.io');

describe('validatePlayer', () => {
  let socket: Socket;

  beforeEach(() => {
    socket = new MockedSocket();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('validated', () => {
    const session = createDefaultSession();
    session.currentPlayers = [
      createDefaultPlayer(1),
      createDefaultPlayer(2),
    ];
    session.currentPlayers[0].connectionId = socket.id;
    const result = validatePlayer(socket, session);
    expect(result).toBe(true);
  });

  test('notValidated', () => {
    const session = createDefaultSession();
    session.currentPlayers = [
      createDefaultPlayer(1),
      createDefaultPlayer(2),
    ];
    const result = validatePlayer(socket, session);
    expect(result).toBe(false);
  });
});
