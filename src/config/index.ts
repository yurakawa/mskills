import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

const configSchema = z.object({
  skills: z.record(
    z.string(),
    z.object({
      path: z.string(),
      sourceUrl: z.string().optional(),
    })
  ).default({}),
  agents: z.array(z.string()).default([]),
});

export type Config = z.infer<typeof configSchema>;

export function getMskillsDir() {
  return path.join(os.homedir(), '.config', 'mskills');
}

export function getConfigPath() {
  return path.join(getMskillsDir(), 'config.json');
}

export function getSkillsDir() {
  return path.join(getMskillsDir(), 'skills');
}

export async function loadConfig(): Promise<Config> {
  try {
    const configPath = getConfigPath();
    const content = await fs.readFile(configPath, 'utf-8');
    const json = JSON.parse(content);
    return configSchema.parse(json);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ENOENT') {
      return configSchema.parse({});
    }
    if (error instanceof SyntaxError) {
      const configPath = getConfigPath();
      throw new Error(`Invalid JSON in configuration file (${configPath}): ${error.message}`);
    }
    throw error;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const mskillsDir = getMskillsDir();
  const configPath = getConfigPath();
  await fs.mkdir(mskillsDir, { recursive: true });
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(configPath, content, 'utf-8');
}
