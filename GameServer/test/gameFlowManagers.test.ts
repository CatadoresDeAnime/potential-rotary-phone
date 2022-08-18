import {Server} from 'socket.io';
import {createDefaultPlayer, createDefaultSession} from './utils';
import {manageCountdown, manageWaitingForPlayers} from '../src/server/gameFlowManagers';
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

describe('manageCountdown', () => {
  let server: Server;

  beforeAll(() => {
    server = new Server(3000);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('startCountdown', () => {
    const session = createDefaultSession();
    manageCountdown(server, session);

    expect(session.countdownInfo.lastCountSentAt).not.toBe(0);
  });

  test('count', () => {
    const count = 5;
    const session = createDefaultSession();
    session.countdownInfo.lastCountSentAt = Date.now() - 2000;
    session.countdownInfo.currentCount = count;
    manageCountdown(server, session);

    expect(session.countdownInfo.currentCount).toBe(count - 1);
  });

  test('finishCount', () => {
    const session = createDefaultSession();
    session.countdownInfo.currentCount = 0;
    session.countdownInfo.lastCountSentAt = Date.now();
    manageCountdown(server, session);

    expect(session.currentPhase).toBe(GamePhases.RUNNING);
  });
});
