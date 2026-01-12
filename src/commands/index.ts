import type { Command } from 'commander';
import { registerAddCommand } from './add.js';
import { registerUpdateCommand } from './update.js';
import { registerRemoveCommand } from './remove.js';
import { registerListCommand } from './list.js';
import { registerAgentsCommand } from './agents.js';
import { registerApplyCommand } from './apply.js';

export function registerCommands(program: Command) {
  registerAddCommand(program);
  registerUpdateCommand(program);
  registerRemoveCommand(program);
  registerListCommand(program);
  registerAgentsCommand(program);
  registerApplyCommand(program);
}
