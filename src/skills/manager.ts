import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, saveConfig, SKILLS_DIR } from '../config/index.js';
import { validateSkill } from './linter.js';
import { pullRepo, isGitUrl, installFromGit } from '../utils/git.js';

export class SkillManager {
  async install(source: string, name?: string) {
    const config = await loadConfig();
    let skillName = name;
    let sourceUrl: string | undefined;

    if (isGitUrl(source)) {
      sourceUrl = source;
      if (!skillName) {
        const parts = source.split('/');
        skillName = parts[parts.length - 1].replace(/\.git$/, '');
      }
    } else {
      if (!skillName) {
        skillName = path.basename(source);
      }
    }

    if (!skillName) {
      throw new Error('Could not determine skill name.');
    }

    if (config.skills[skillName]) {
      throw new Error(`Skill '${skillName}' already exists.`);
    }

    const internalPath = path.join(SKILLS_DIR, skillName);

    if (sourceUrl) {
      await fs.mkdir(SKILLS_DIR, { recursive: true });
      try {
        await installFromGit(sourceUrl, internalPath);
        await validateSkill(internalPath);
      } catch (error) {
        // Cleanup on failure
        await fs.rm(internalPath, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
    } else {
      const absolutePath = path.resolve(source);
      await validateSkill(absolutePath);
      await fs.mkdir(SKILLS_DIR, { recursive: true });
      await fs.cp(absolutePath, internalPath, { recursive: true });
    }

    config.skills[skillName] = {
      path: internalPath,
      sourceUrl,
    };
    await saveConfig(config);
  }

  async add(name: string, skillPath: string) {
    return this.install(skillPath, name);
  }

  async update(name: string, source?: string) {
    const config = await loadConfig();
    const skillConfig = config.skills[name];
    if (!skillConfig) {
      throw new Error(`Skill '${name}' not found.`);
    }

    const currentPath = skillConfig.path;

    if (source) {
      if (isGitUrl(source)) {
        if (skillConfig.sourceUrl === source) {
          // Check if it's a standard git repo (has .git)
          const gitDir = path.join(currentPath, '.git');
          try {
            await fs.access(gitDir);
            await pullRepo(currentPath);
          } catch {
             // No .git directory, implies subdirectory install or other non-git structure. Re-install.
             await fs.rm(currentPath, { recursive: true, force: true });
             await installFromGit(source, currentPath);
          }
        } else {
          // New Source URL - Reinstall
          await fs.rm(currentPath, { recursive: true, force: true });
          await installFromGit(source, currentPath);
          skillConfig.sourceUrl = source;
          await saveConfig(config);
        }
      } else {
        // Local source
        const absolutePath = path.resolve(source);
        await validateSkill(absolutePath);
        // Clear directory before copying to ensure clean update? 
        // Or just copy over? fs.cp overwrites.
        // To be safe and remove deleted files, we might want to clear, but that loses any local uncommitted changes (which shouldn't be there ideally). 
        // For local skill update, standard is usually just cp.
        await fs.cp(absolutePath, currentPath, { recursive: true });
        
        if (skillConfig.sourceUrl) {
          delete skillConfig.sourceUrl;
          await saveConfig(config);
        }
      }
    } else {
      if (skillConfig.sourceUrl) {
         // Check if it's a standard git repo (has .git)
          const gitDir = path.join(currentPath, '.git');
          try {
            await fs.access(gitDir);
            await pullRepo(currentPath);
          } catch {
             // Re-install from stored URL
             await fs.rm(currentPath, { recursive: true, force: true });
             await installFromGit(skillConfig.sourceUrl, currentPath);
          }
      } else {
        throw new Error(`Original source path for '${name}' is not stored. Please provide a path or URL to update from.`);
      }
    }
    
    await validateSkill(currentPath);
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
