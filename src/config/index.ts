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

const OLD_CONFIG_PATH = path.join(os.homedir(), '.mskills.json');
const DOT_MSKILLS_DIR = path.join(os.homedir(), '.mskills');

export function getMskillsDir() {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'mskills');
  }
  return path.join(os.homedir(), '.config', 'mskills');
}

export function getConfigPath() {
  return path.join(getMskillsDir(), 'config.json');
}

export function getSkillsDir() {
  return path.join(getMskillsDir(), 'skills');
}

async function migrateConfig() {
  try {
    // 1. Migrate ~/.mskills.json to newer structure (~/.config/mskills/config.json)
    // This is for very old versions.
    try {
      const stats = await fs.stat(OLD_CONFIG_PATH);
      if (stats.isFile()) {
        await fs.mkdir(getMskillsDir(), { recursive: true });
        await fs.rename(OLD_CONFIG_PATH, getConfigPath());
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

    // 2. Migrate ~/.mskills/ directory to ~/.config/mskills/
    try {
      const dotMskillsStats = await fs.stat(DOT_MSKILLS_DIR);
      const mskillsDir = getMskillsDir();
      if (dotMskillsStats.isDirectory() && DOT_MSKILLS_DIR !== mskillsDir) {
        // Only migrate if the target directory doesn't exist yet
        try {
          await fs.stat(mskillsDir);
        } catch (e: any) {
          if (e.code === 'ENOENT') {
            await fs.mkdir(path.dirname(mskillsDir), { recursive: true });
            await fs.rename(DOT_MSKILLS_DIR, mskillsDir);
            console.log(`Moved ${DOT_MSKILLS_DIR} to ${mskillsDir}`);
          }
        }
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

  } catch (error: unknown) {
    console.warn(`Warning: Failed to migrate existing config: ${error}`);
  }
}

export async function loadConfig(): Promise<Config> {
  await migrateConfig();
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
