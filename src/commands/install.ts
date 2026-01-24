import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';
import { ValidationError } from '../skills/linter.js';

export function registerInstallCommand(program: Command) {
  program
    .command('install')
    .description('Install a skill from a GitHub URL or local path')
    .argument('<source>', 'GitHub URL or path to the skill')
    .argument('[name]', 'Skill name (optional, derived from source if not provided)')
    .action(async (source, name) => {
      try {
        await skillManager.install(source, name);
        console.log(chalk.green(`✓ Skill installed.`));
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
