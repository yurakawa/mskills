import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';

export function registerRemoveCommand(program: Command) {
  program
    .command('remove')
    .description('Remove skills')
    .argument('<names...>', 'Skill names')
    .action(async (names: string[]) => {
      for (const name of names) {
        try {
          await skillManager.remove(name);
          console.log(chalk.green(`✓ Skill '${name}' removed`));
        } catch (error: unknown) {
          console.error(chalk.red(`Error: ${getErrorMessage(error)}`));
        }
      }
    });
}
