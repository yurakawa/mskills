import path from 'node:path';
import { loadConfig, saveConfig } from '../config/index.js';

export class SkillManager {
  async add(name: string, skillPath: string) {
    const config = await loadConfig();
    const absolutePath = path.resolve(skillPath);
    config.skills[name] = { path: absolutePath };
    await saveConfig(config);
  }

  async remove(name: string) {
    const config = await loadConfig();
    if (config.skills[name]) {
      delete config.skills[name];
      await saveConfig(config);
    } else {
      throw new Error(`Skill '${name}' not found.`);
    }
  }

  async list() {
    const config = await loadConfig();
    return config.skills;
  }
}

export const skillManager = new SkillManager();
