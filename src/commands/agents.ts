import { Command } from 'commander';
import chalk from 'chalk';
import { agentManager } from '../agents/manager.js';

export function registerAgentsCommand(program: Command) {
  const agentsCmd = program
    .command('agents')
    .description('Manage target agents');

  agentsCmd
    .command('add')
    .description('Enable agents')
    .argument('<names...>', 'Agent names')
    .action(async (names: string[]) => {
      for (const name of names) {
        try {
          await agentManager.enable(name);
          console.log(chalk.green(`✓ Agent '${name}' enabled`));
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exitCode = 1;
        }
      }
    });

  agentsCmd
    .command('remove')
    .description('Disable agents')
    .argument('<names...>', 'Agent names')
    .action(async (names: string[]) => {
      for (const name of names) {
        try {
          await agentManager.disable(name);
          console.log(chalk.green(`✓ Agent '${name}' disabled`));
        } catch (error: any) {
          console.error(chalk.red(`Error: ${error.message}`));
          process.exitCode = 1;
        }
      }
    });

  agentsCmd
    .command('list')
    .description('List enabled agents')
    .action(async () => {
      const enabled = await agentManager.listEnabled();
      const supported = agentManager.listSupported();

      console.log(chalk.bold('Enabled Agents:'));
      if (enabled.length === 0) {
        console.log('  (none)');
      } else {
        enabled.forEach((a) => console.log(`  ${chalk.green(a)}`));
      }

      console.log(chalk.bold('\nSupported Agents:'));
      supported.forEach((a) => console.log(`  ${a}`));
    });
}
