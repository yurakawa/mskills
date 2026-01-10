#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const program = new Command();

program
  .name('mskills')
  .description('Manage your AI Agent Skills in one place')
  .version('0.1.0');

registerCommands(program);

program.parse();
