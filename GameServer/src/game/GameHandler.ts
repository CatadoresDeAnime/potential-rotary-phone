import Game from '@danielmontes/darkness';
import BehaviourTree from '@danielmontes/darkness/build/game/bot/BehaviorTree';
import {EnqueuedEvent} from '@danielmontes/darkness/build/game/Event';
import Player from '@danielmontes/darkness/build/game/Player';
import {GamePhase} from '@danielmontes/darkness/build/game/types';
import createBehaviourTree from '@danielmontes/darkness/build/game/bot/BehaviourTreeFactoty';
import {IPlayer} from '../server/types';
import {
  IState, IStateBoard, IStateMatrix, IStatePlayer,
} from './gameState';

type Behavior = 'atack' | 'defense' | 'random';

function getRandomBehavior() {
  const behaviors: Behavior[] = ['atack', 'defense', 'random'];
  return behaviors[Math.floor(Math.random() * 3)];
}

export default class GameHandler {
  game: Game;

  behaviorTrees: BehaviourTree[];

  constructor() {
    this.game = new Game([]);
    this.game.players = [];
    this.behaviorTrees = [];
  }

  addPlayer(player: IPlayer) {
    if (this.game.players.length === 4) {
      return -1;
    }
    const id = this.game.players.length;
    this.game.players.push(new Player(player.name, id));
    return id;
  }

  start() {
    this.fillPlayersWithBots();
    this.game.start();
  }

  update() {
    this.botActions();
    this.game.update();
  }

  botActions() {
    if (this.game.phase === GamePhase.RUNNING) {
      this.behaviorTrees.forEach((tree) => {
        tree.nextAction();
      });
    }
  }

  addEvent(event: EnqueuedEvent) {
    this.game.addEvent(event);
  }

  fillPlayersWithBots() {
    for (let id = this.game.players.length; id < 4; id++) {
      const tree = createBehaviourTree(getRandomBehavior());
      tree.bind(this.game, id);
      this.behaviorTrees.push(tree);
      this.addPlayer({name: `bot ${id}`, token: '', connectionId: ''});
    }
  }

  getNextMessage(playerId: number) {
    const message = this.game.getNextMessage(playerId);
    if (message !== undefined) {
      return {
        content: message.content,
        type: message.type,
      };
    }
    return message;
  }

  getPlayer(playerId: number): IStatePlayer {
    const player = this.game.players[playerId];
    const hand = player.hand.map((piece) => ({
      type: piece.type,
      quantity: piece.quantity,
      isActive: piece.isActive,
    }));
    return {
      message: this.getNextMessage(playerId),
      id: playerId,
      name: player.name,
      score: player.score,
      hand,
      isDead: player.isDead,
    };
  }

  getMatrix(): IStateMatrix {
    const matrix = this.game.board.matrix.matrix.map((row) => row.map((cell) => ({
      health: cell.health,
    })));
    return {
      rows: this.game.board.matrix.rows,
      cols: this.game.board.matrix.cols,
      matrix,
    };
  }

  getBalls(playerId: number) {
    return this.game.board.balls[playerId].map((ball) => ({
      type: ball.type,
      position: ball.position,
    }));
  }

  getArrows(playerId: number) {
    return {
      angle: this.game.board.arrows[playerId].angle,
    };
  }

  getBoard(): IStateBoard {
    return {
      matrix: this.getMatrix(),
      balls: [0, 1, 2, 3].map((id) => this.getBalls(id)),
      arrows: [0, 1, 2, 3].map((id) => this.getArrows(id)),
    };
  }

  getRouletteOptions(playerId: number) {
    return this.game.players[playerId].roulette.options.map((option) => option.name);
  }

  getRouletteSelectedOption(playerId: number) {
    return this.game.players[playerId].roulette.selectedOption;
  }

  getState(): IState {
    const rouletteOptions = [0, 1, 2, 3].map((id) => this.getRouletteOptions(id));
    const rouletteSelectedOptions = [0, 1, 2, 3].map((id) => this.getRouletteSelectedOption(id));
    return {
      players: [0, 1, 2, 3].map((id) => this.getPlayer(id)),
      gameInfo: {
        beginTime: this.game.beginTime,
        endTime: this.game.endTime,
        phase: this.game.phase,
      },
      board: this.getBoard(),
      rouletteOptions,
      rouletteSelectedOptions,
    };
  }
}
