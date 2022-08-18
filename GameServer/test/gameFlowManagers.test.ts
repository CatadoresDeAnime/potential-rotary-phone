import {Server} from 'socket.io';
import {createDefaultPlayer, createDefaultSession} from './utils';
import {manageWaitingForPlayers} from '../src/server/gameFlowManagers';
import Config from '../src/server/Config';
import GamePhases from '../src/server/GamePhases';

jest.mock('socket.io');

describe('manageWaitingForPlayers', () => {
  let server: Server;

  beforeAll(() => {
    server = new Server(3000);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('waitingTimeExceeded', () => {
    const session = createDefaultSession();
    session.waitingForPlayersInfo.sessionStartedAt = Date.now() - 2 * Config.maxWaitingTime;
    manageWaitingForPlayers(server, session);
    expect(session.currentPhase).toBe(GamePhases.FINISHED);
  });

  test('playerWaitingTimeExceeded', () => {
    const session = createDefaultSession();
    session.currentPlayers = [createDefaultPlayer()];
    session.waitingForPlayersInfo.firstPlayerConnectedAt = Date.now()
      - 2 * Config.maxPlayersWaitingTime;
    manageWaitingForPlayers(server, session);
    expect(session.currentPhase).toBe(GamePhases.COUNTDOWN);
  });

  test('countdownStarted', () => {
    const session = createDefaultSession();
    session.currentPlayers = [
      createDefaultPlayer(1),
      createDefaultPlayer(2),
      createDefaultPlayer(3),
      createDefaultPlayer(4),
    ];
    manageWaitingForPlayers(server, session);
    expect(session.currentPhase).toBe(GamePhases.COUNTDOWN);
  });
});
