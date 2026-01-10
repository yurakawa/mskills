import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';

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
      } catch (error: any) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });
}
