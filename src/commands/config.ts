import { Command } from 'commander';
import chalk from 'chalk';
import { CONFIG_PATH, SKILLS_DIR } from '../config/index.js';

export function registerConfigCommand(program: Command) {
  program
    .command('config')
    .description('Show configuration paths')
    .action(() => {
      console.log(`${chalk.bold('Configuration Info:')}`);
      console.log(`  Config File: ${chalk.cyan(CONFIG_PATH)}`);
      console.log(`  Skills Dir:  ${chalk.cyan(SKILLS_DIR)}`);
    });
}
