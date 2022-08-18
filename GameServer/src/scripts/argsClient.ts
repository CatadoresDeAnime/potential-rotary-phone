import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .env()
  .options({
    host: {default: 'ws://localhost'},
    port: {default: 3000},
    nodeEnv: {default: 'DEVELOPMENT'},
    token: {type: 'string'},
  })
  .check((args) => {
    if (args.token === undefined) {
      throw new Error('No token provided provided');
    }
    return true;
  })
  .parseSync();

export default argv;
