import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';
import { ValidationError } from '../skills/linter.js';

export function registerAddCommand(program: Command) {
  program
    .command('add')
    .description('Add a skill')
    .argument('<name>', 'Skill name')
    .argument('<path>', 'Path to the skill directory')
    .action(async (name, path) => {
      try {
        await skillManager.add(name, path);
        console.log(chalk.green(`✓ Skill '${name}' added`));
      } catch (error: unknown) {
        if (error instanceof ValidationError) {
          console.error(chalk.red(`Validation Error: ${error.message}`));
        } else {
          console.error(chalk.red(`Error: ${getErrorMessage(error)}`));
        }
        process.exit(1);
      }
    });
}
