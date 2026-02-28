import { Command } from 'commander';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadConfig, getMskillsDir } from '../config/index.js';
import AdmZip from 'adm-zip';

export function registerExportCommand(program: Command) {
  const exportCmd = program
    .command('export')
    .description('Export skills or configuration as a zip file');

  exportCmd
    .command('skill <name> [outPath]')
    .description('Export a specific skill as a zip file')
    .action(async (name: string, outPath?: string) => {
      try {
        const config = await loadConfig();
        const skill = config.skills[name];
        
        if (!skill) {
          console.error(chalk.red(`Error: Skill '${name}' not found.`));
          process.exit(1);
        }

        const skillPath = skill.path;
        try {
            await fs.stat(skillPath);
        } catch {
            console.error(chalk.red(`Error: Skill directory not found at ${skillPath}`));
            process.exit(1);
        }

        const targetPath = outPath ? path.resolve(outPath) : path.resolve(process.cwd(), `${name}.zip`);
        
        const zip = new AdmZip();
        zip.addLocalFolder(skillPath);
        zip.writeZip(targetPath);
        
        console.log(chalk.green(`Successfully exported skill '${name}' to ${targetPath}`));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Error exporting skill: ${message}`));
        process.exit(1);
      }
    });

  exportCmd
    .command('config [outPath]')
    .description('Export configuration file as a zip file')
    .action(async (outPath?: string) => {
      try {
        const mskillsDir = getMskillsDir();
        try {
            await fs.stat(mskillsDir);
        } catch {
            console.error(chalk.red(`Error: Configuration directory not found at ${mskillsDir}`));
            process.exit(1);
        }

        const targetPath = outPath ? path.resolve(outPath) : path.resolve(process.cwd(), `mskills-config.zip`);
        
        const zip = new AdmZip();
        zip.addLocalFolder(mskillsDir);
        zip.writeZip(targetPath);
        
        console.log(chalk.green(`Successfully exported configuration to ${targetPath}`));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Error exporting configuration: ${message}`));
        process.exit(1);
      }
    });
}
