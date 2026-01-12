import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';

export function registerUpdateCommand(program: Command) {
  program
    .command('update')
    .description('Update a skill from source')
    .argument('<name>', 'Skill name')
    .argument('[path]', 'Path to the skill directory (optional if updating from registered path)')
    .action(async (name, path) => {
      try {
        await skillManager.update(name, path);
        console.log(chalk.green(`✓ Skill '${name}' updated`));
      } catch (error: unknown) {
        console.error(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });
}
