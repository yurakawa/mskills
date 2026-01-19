import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, saveConfig, SKILLS_DIR } from '../config/index.js';
import { validateSkill } from './linter.js';

export class SkillManager {
  async add(name: string, skillPath: string) {
    const config = await loadConfig();
    const absolutePath = path.resolve(skillPath);

    // Lint the skill before adding
    await validateSkill(absolutePath);

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
      // Refresh from new path and lint
      await validateSkill(sourcePath);
      await fs.cp(sourcePath, skillConfig.path, { recursive: true });
    } else {
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

  async getSkillsWithMetadata() {
    const config = await loadConfig();
    const skills = [];
    for (const [name, skillConfig] of Object.entries(config.skills)) {
      try {
        const metadata = await validateSkill(skillConfig.path);
        skills.push({
          name: metadata.name,
          description: metadata.description,
          path: skillConfig.path,
        });
      } catch (error) {
        console.warn(`Warning: Failed to load metadata for skill '${name}':`, error instanceof Error ? error.message : String(error));
      }
    }
    return skills;
  }
}

export const skillManager = new SkillManager();
