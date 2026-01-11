import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skillManager } from './manager.js';
import * as configModule from '../config/index.js';


vi.mock('../config/index.js');

describe('SkillManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(configModule.loadConfig).mockResolvedValue({ skills: {}, agents: [] });
  });

  describe('add', () => {
    it('should add a skill to config', async () => {
      await skillManager.add('test-skill', './relative/path');

      expect(configModule.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        skills: expect.objectContaining({
          'test-skill': expect.objectContaining({
            path: expect.stringContaining('relative/path') // resolve logic makes it absolute
          })
        })
      }));
    });
  });

  describe('remove', () => {
    it('should remove a skill from config', async () => {
      vi.mocked(configModule.loadConfig).mockResolvedValue({
        skills: { 'test-skill': { path: '/abs/path' } },
        agents: []
      });

      await skillManager.remove('test-skill');

      expect(configModule.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        skills: {}
      }));
    });

    it('should throw error if skill not found', async () => {
      await expect(skillManager.remove('non-existent')).rejects.toThrow();
    });
  });
});
