import Game from '@danielmontes/darkness';
import BehaviourTree from '@danielmontes/darkness/build/game/bot/BehaviorTree';
import {EnqueuedEvent} from '@danielmontes/darkness/build/game/Event';
import Player from '@danielmontes/darkness/build/game/Player';
import {GamePhase} from '@danielmontes/darkness/build/game/types';
import createBehaviourTree from '@danielmontes/darkness/build/game/bot/BehaviourTreeFactoty';
import {Player as IPlayer} from '../server/types';

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
      this.addPlayer({name: `bot ${id}`, token: ''});
    }
  }
}
