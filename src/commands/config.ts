import { Command } from 'commander';
import chalk from 'chalk';
import { getConfigPath, getSkillsDir } from '../config/index.js';

export function registerConfigCommand(program: Command) {
  program
    .command('config')
    .description('Show configuration paths')
    .action(() => {
      console.log(`${chalk.bold('Configuration Info:')}`);
      console.log(`  Config File: ${chalk.cyan(getConfigPath())}`);
      console.log(`  Skills Dir:  ${chalk.cyan(getSkillsDir())}`);
    });
}
