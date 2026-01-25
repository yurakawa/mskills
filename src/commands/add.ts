import type { Command } from 'commander';
import chalk from 'chalk';
import { skillManager } from '../skills/manager.js';
import { getErrorMessage } from '../utils/error.js';
import { ValidationError } from '../skills/linter.js';

import fs from 'node:fs';
import path from 'node:path';
import { isGitUrl } from '../utils/git.js';

export function registerAddCommand(program: Command) {
  program
    .command('add')
    .description('Add a skill (supports both <source> [name] and legacy <name> <path>)')
    .argument('<source>', 'GitHub URL, local path, or skill name (legacy)')
    .argument('[name]', 'Skill name or local path (legacy)')
    .action(async (arg1, arg2) => {
      try {
        let source = arg1;
        let skillName = arg2;

        // heuristic to detect legacy usage: mskills add <name> <path>
        // If arg2 looks like a path/URL and arg1 does not, swap them.
        if (skillName && (isGitUrl(skillName) || fs.existsSync(path.resolve(skillName)))) {
             if (!isGitUrl(source) && !fs.existsSync(path.resolve(source))) {
                 console.warn(chalk.yellow('! Detected legacy arguments (<name> <path>). Please use `add <path> [name]` in the future.'));
                 const temp = source;
                 source = skillName;
                 skillName = temp;
             }
        }

        await skillManager.add(source, skillName);
        console.log(chalk.green(`✓ Skill added.`));
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
