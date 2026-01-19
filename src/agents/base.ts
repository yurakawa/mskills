import os from 'node:os';
import path from 'node:path';

export interface Agent {
  name: string;
  getSkillsDir(): string;
}

export const SUPPORTED_AGENTS: Record<string, Agent> = {
  claude: {
    name: 'claude',
    getSkillsDir: () => path.join(os.homedir(), '.claude', 'skills'),
  },
  cursor: {
    name: 'cursor',
    getSkillsDir: () => path.join(os.homedir(), '.cursor', 'skills'),
  },
  codex: {
    name: 'codex',
    getSkillsDir: () => path.join(os.homedir(), '.codex', 'skills'),
  },
  gemini: {
    name: 'gemini',
    getSkillsDir: () => path.join(os.homedir(), '.gemini', 'skills'),
  },
  'github-copilot-cli': {
    name: 'github-copilot-cli',
    getSkillsDir: () => path.join(os.homedir(), '.copilot', 'skills'),
  },
  antigravity: {
    name: 'antigravity',
    getSkillsDir: () => path.join(os.homedir(), '.gemini', 'antigravity', 'skills'),
  },
};
