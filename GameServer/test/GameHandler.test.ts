import GameHandler from '../src/game/GameHandler';
import {createDefaultPlayer} from './utils';

describe('GameHandler', () => {
  test('addPlayer', () => {
    const gameHandler = new GameHandler();
    gameHandler.addPlayer(createDefaultPlayer());
    expect(gameHandler.game.players).toHaveLength(1);

    for (let i = 0; i < 4; i++) {
      gameHandler.addPlayer(createDefaultPlayer());
    }

    expect(gameHandler.game.players).toHaveLength(4);
  });

  test('fillPlayersWithBots', () => {
    const gameHandler = new GameHandler();
    gameHandler.fillPlayersWithBots();

    expect(gameHandler.game.players).toHaveLength(4);
  });
});
