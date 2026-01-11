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

const CONFIG_PATH = path.join(os.homedir(), '.mskills.json');

export async function loadConfig(): Promise<Config> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const json = JSON.parse(content);
    return configSchema.parse(json);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return configSchema.parse({});
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file (${CONFIG_PATH}): ${error.message}`);
    }
    throw error;
  }
}

export async function saveConfig(config: Config): Promise<void> {
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(CONFIG_PATH, content, 'utf-8');
}
