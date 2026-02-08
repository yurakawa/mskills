import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, saveConfig, getConfigPath, getSkillsDir, getMskillsDir } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';


vi.mock('node:fs/promises');
vi.mock('node:os', () => ({
  default: {
    homedir: vi.fn(() => '/mock/home'),
  },
}));

describe('Config', () => {
  const mockHomeDir = '/mock/home';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.stat).mockRejectedValue({ code: 'ENOENT' });
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.rename).mockResolvedValue(undefined);
  });

  describe('paths', () => {
    it('should return default paths', () => {
       expect(getMskillsDir()).toBe(path.join(mockHomeDir, '.config', 'mskills'));
       expect(getConfigPath()).toBe(path.join(mockHomeDir, '.config', 'mskills', 'config.json'));
       expect(getSkillsDir()).toBe(path.join(mockHomeDir, '.config', 'mskills', 'skills'));
    });
  });

  describe('loadConfig', () => {
    it('should return default config if file does not exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue({ code: 'ENOENT' });

      const config = await loadConfig();

      expect(config).toEqual({ skills: {}, agents: [] });
    });

    it('should return parsed config if file exists', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await loadConfig();

      expect(config).toEqual(mockConfig);
    });
  });

  describe('saveConfig', () => {
    it('should write config to file', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };

      await saveConfig(mockConfig);

      expect(fs.writeFile).toHaveBeenCalledWith(
        getConfigPath(),
        JSON.stringify(mockConfig, null, 2),
        'utf-8'
      );
    });
  });
});
