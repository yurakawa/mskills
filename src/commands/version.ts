import { Command } from 'commander';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

export function registerVersionCommand(program: Command) {
  program
    .command('version')
    .description('Show version information')
    .action(() => {
      console.log(pkg.version);
    });
}
