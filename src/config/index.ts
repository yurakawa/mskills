import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';

const configSchema = z.object({
  skills: z.record(
    z.string(),
    z.object({
      path: z.string(),
    })
  ).default({}),
  agents: z.array(z.string()).default([]),
});

export type Config = z.infer<typeof configSchema>;

const OLD_CONFIG_PATH = path.join(os.homedir(), '.mskills.json');
const MSKILLS_DIR = path.join(os.homedir(), '.mskills');
export const CONFIG_PATH = path.join(MSKILLS_DIR, 'config.json');
export const SKILLS_DIR = path.join(MSKILLS_DIR, 'skills');

async function migrateConfig() {
  try {
    const stats = await fs.stat(OLD_CONFIG_PATH);
    if (stats.isFile()) {
      await fs.mkdir(MSKILLS_DIR, { recursive: true });
      await fs.rename(OLD_CONFIG_PATH, CONFIG_PATH);
    }
  } catch (error: unknown) {
    if ((error as { code?: string }).code !== 'ENOENT') {
      console.warn(`Warning: Failed to migrate existing config: ${error}`);
    }
  }
}

export async function loadConfig(): Promise<Config> {
  await migrateConfig();
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const json = JSON.parse(content);
    return configSchema.parse(json);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'ENOENT') {
      return configSchema.parse({});
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file (${CONFIG_PATH}): ${error.message}`);
    }
    throw error;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await fs.mkdir(MSKILLS_DIR, { recursive: true });
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(CONFIG_PATH, content, 'utf-8');
}
