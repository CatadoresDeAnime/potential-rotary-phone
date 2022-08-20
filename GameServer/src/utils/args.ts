import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .env()
  .options({
    tokens: {type: 'string'},
    port: {default: 3000},
    nodeEnv: {default: 'DEVELOPMENT'},
  })
  .check((args) => {
    if (args.tokens === undefined) {
      throw new Error('No token list provided.');
    }
    return true;
  })
  .parseSync();

export default argv;
