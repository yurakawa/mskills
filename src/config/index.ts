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

function getMskillsDir() {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    return path.join(xdgConfigHome, 'mskills');
  }
  return path.join(os.homedir(), '.config', 'mskills');
}

export const MSKILLS_DIR = getMskillsDir();
export const CONFIG_PATH = path.join(MSKILLS_DIR, 'config.json');
export const SKILLS_DIR = path.join(MSKILLS_DIR, 'skills');

async function migrateConfig() {
  try {
    // 1. Migrate ~/.mskills.json to newer structure (~/.config/mskills/config.json)
    // This is for very old versions.
    try {
      const stats = await fs.stat(OLD_CONFIG_PATH);
      if (stats.isFile()) {
        await fs.mkdir(MSKILLS_DIR, { recursive: true });
        await fs.rename(OLD_CONFIG_PATH, CONFIG_PATH);
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

    // 2. Migrate ~/.mskills/ directory to ~/.config/mskills/
    try {
      const dotMskillsStats = await fs.stat(DOT_MSKILLS_DIR);
      if (dotMskillsStats.isDirectory() && DOT_MSKILLS_DIR !== MSKILLS_DIR) {
        // Only migrate if the target directory doesn't exist yet
        try {
          await fs.stat(MSKILLS_DIR);
        } catch (e: any) {
          if (e.code === 'ENOENT') {
            await fs.mkdir(path.dirname(MSKILLS_DIR), { recursive: true });
            await fs.rename(DOT_MSKILLS_DIR, MSKILLS_DIR);
            console.log(`Moved ${DOT_MSKILLS_DIR} to ${MSKILLS_DIR}`);
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
