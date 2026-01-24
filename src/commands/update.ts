import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';

export function registerUpdateCommand(program: Command) {
  program
    .command('update')
    .description('Update a skill from source')
    .argument('<name>', 'Skill name')
    .argument('[source]', 'GitHub URL or path to update from (optional if installed from Git)')
    .action(async (name, source) => {
      try {
        await skillManager.update(name, source);
        console.log(chalk.green(`✓ Skill '${name}' updated`));
      } catch (error: unknown) {
        console.error(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });
}
