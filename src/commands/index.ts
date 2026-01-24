import type { Command } from 'commander';
import { registerInstallCommand } from './install.js';
import { registerAddCommand } from './add.js';
import { registerUpdateCommand } from './update.js';
import { registerRemoveCommand } from './remove.js';
import { registerListCommand } from './list.js';
import { registerAgentsCommand } from './agents.js';
import { registerApplyCommand } from './apply.js';
import { registerConfigCommand } from './config.js';
import { registerVersionCommand } from './version.js';

import { registerPromptCommand } from './prompt.js';

export function registerCommands(program: Command) {
  registerInstallCommand(program);
  registerAddCommand(program);
  registerUpdateCommand(program);
  registerRemoveCommand(program);
  registerListCommand(program);
  registerAgentsCommand(program);
  registerApplyCommand(program);
  registerPromptCommand(program);
  registerConfigCommand(program);
  registerVersionCommand(program);
}
