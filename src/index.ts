#!/usr/bin/env node
import { Command } from 'commander';
import { registerCommands } from './commands/index.js';

const program = new Command();

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');

program
  .name('mskills')
  .description('Manage your AI Agent Skills in one place')
  .version(pkg.version);

registerCommands(program);

program.parse();
