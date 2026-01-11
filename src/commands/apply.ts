import fs from 'node:fs/promises';
import path from 'node:path';
import { Command, Option } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config/index.js';
import { SUPPORTED_AGENTS } from '../agents/base.js';
import { getErrorMessage } from '../utils/error.js';

export function registerApplyCommand(program: Command) {
  program
    .command('apply')
    .description('Apply skills to agents')
    .addOption(new Option('-m, --mode <mode>', 'Apply mode').choices(['symlink', 'copy']).default('symlink'))
    .option('-f, --force', 'Force overwrite of existing skills')
    .action(async (options) => {
      const spinner = ora('Loading configuration...').start();
      try {
        const config = await loadConfig();
        const mode = options.mode as 'symlink' | 'copy';
        const force = !!options.force;

        if (Object.keys(config.skills).length === 0) {
          spinner.warn('No skills configured.');
          return;
        }
        if (config.agents.length === 0) {
          spinner.warn('No agents enabled.');
          return;
        }

        spinner.text = 'Applying skills...';
        
        for (const agentName of config.agents) {
          const agent = SUPPORTED_AGENTS[agentName];
          if (!agent) {
            spinner.warn(`Skipping unknown agent: ${agentName}`);
            continue;
          }

          const skillsDir = agent.getSkillsDir();
          spinner.text = `Applying to ${agent.name} (${skillsDir})...`;

          // Ensure skills dir exists
          await fs.mkdir(skillsDir, { recursive: true });

          for (const [skillName, skillConfig] of Object.entries(config.skills)) {
             const targetPath = path.join(skillsDir, skillName);
             const sourcePath = skillConfig.path;

             try {
                // Check if target exists
                const stats = await fs.lstat(targetPath).catch(() => null);

                if (stats) {
                   // 1. If it's a symlink and correct, we are good.
                   if (mode === 'symlink' && stats.isSymbolicLink()) {
                       const currentLink = await fs.readlink(targetPath);
                       if (currentLink === sourcePath) {
                           continue; // Already correct
                       }
                   }

                   // 2. Conflict detected
                   if (!force) {
                       spinner.warn(`Conflict: '${skillName}' already exists at ${targetPath}. Use --force to overwrite.`);
                       continue;
                   }

                   // 3. Force enabled: remove existing
                   // Safe for both files, directories, and symlinks
                   await fs.rm(targetPath, { recursive: true, force: true });
                }

                if (mode === 'symlink') {
                    await fs.symlink(sourcePath, targetPath, 'dir'); // 'dir' is ignored on non-windows but good practice
                } else {
                    await fs.cp(sourcePath, targetPath, { recursive: true });
                }

             } catch (err: unknown) {
                 spinner.warn(`Failed to apply ${skillName} to ${agentName}: ${getErrorMessage(err)}`);
             }
          }
        }

        spinner.succeed(chalk.green('Skills applied successfully!'));
      } catch (error: unknown) {
        spinner.fail(chalk.red(`Error: ${getErrorMessage(error)}`));
        process.exit(1);
      }
    });
}
