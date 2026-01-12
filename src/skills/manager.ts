import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, saveConfig, SKILLS_DIR } from '../config/index.js';

export class SkillManager {
  async add(name: string, skillPath: string) {
    const config = await loadConfig();
    const absolutePath = path.resolve(skillPath);

    // Verify SKILL.md exists in the source path
    try {
      await fs.access(path.join(absolutePath, 'SKILL.md'));
    } catch {
      throw new Error(`Invalid skill: SKILL.md not found in ${absolutePath}`);
    }

    // Ensure mskills directory exists
    await fs.mkdir(SKILLS_DIR, { recursive: true });

    // Copy to internal storage
    const internalPath = path.join(SKILLS_DIR, name);
    await fs.cp(absolutePath, internalPath, { recursive: true });

    config.skills[name] = { path: internalPath };
    await saveConfig(config);
  }

  async update(name: string, skillPath?: string) {
    const config = await loadConfig();
    const skillConfig = config.skills[name];
    if (!skillConfig) {
      throw new Error(`Skill '${name}' not found.`);
    }

    const sourcePath = skillPath ? path.resolve(skillPath) : null;
    if (sourcePath) {
      // Refresh from new path
      try {
        await fs.access(path.join(sourcePath, 'SKILL.md'));
      } catch {
        throw new Error(`Invalid skill: SKILL.md not found in ${sourcePath}`);
      }
      await fs.cp(sourcePath, skillConfig.path, { recursive: true });
    } else {
      // This is basically a "sync" or "refresh" if we had git support,
      // but for local paths without a source, we might not be able to do much
      // unless we store the original source path.
      throw new Error(`Original source path for '${name}' is not stored. Please provide a path to update from.`);
    }
  }

  async remove(name: string) {
    const config = await loadConfig();
    if (config.skills[name]) {
      const internalPath = path.join(SKILLS_DIR, name);
      
      // Delete from internal storage
      await fs.rm(internalPath, { recursive: true, force: true });

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
