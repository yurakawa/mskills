import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skillManager } from './manager.js';
import fs from 'node:fs/promises';
import { loadConfig, saveConfig, SKILLS_DIR } from '../config/index.js';

vi.mock('node:fs/promises');
vi.mock('../config/index.js');

describe('SkillManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadConfig).mockResolvedValue({ skills: {}, agents: [] });
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.cp).mockResolvedValue(undefined);
    vi.mocked(fs.rm).mockResolvedValue(undefined);
  });

  describe('add', () => {
    it('should add a skill to config', async () => {
      await skillManager.add('test-skill', './relative/path');

      expect(fs.access).toHaveBeenCalled();
      expect(fs.cp).toHaveBeenCalled();
      expect(saveConfig).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a skill from config', async () => {
      vi.mocked(loadConfig).mockResolvedValue({
        skills: { 'test-skill': { path: '/abs/path' } },
        agents: []
      });

      await skillManager.remove('test-skill');

      expect(saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        skills: {}
      }));
    });

    it('should throw error if skill not found', async () => {
      await expect(skillManager.remove('non-existent')).rejects.toThrow();
    });
  });
});
