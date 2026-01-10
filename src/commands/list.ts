import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';

export function registerListCommand(program: Command) {
  program
    .command('list')
    .description('List skills')
    .action(async () => {
      const skills = await skillManager.list();
      if (Object.keys(skills).length === 0) {
        console.log('No skills configured.');
        return;
      }
      for (const [name, config] of Object.entries(skills)) {
        console.log(`${chalk.bold(name)}: ${config.path}`);
      }
    });
}
