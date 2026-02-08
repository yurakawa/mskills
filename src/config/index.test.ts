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
  const mockDotMskillsDir = path.join(mockHomeDir, '.mskills');
  const mockOldConfigPath = path.join(mockHomeDir, '.mskills.json');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('XDG_CONFIG_HOME', '');
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

    it('should respect XDG_CONFIG_HOME', () => {
       const customXdg = '/custom/xdg';
       vi.stubEnv('XDG_CONFIG_HOME', customXdg);
       expect(getMskillsDir()).toBe(path.join(customXdg, 'mskills'));
       expect(getConfigPath()).toBe(path.join(customXdg, 'mskills', 'config.json'));
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

    it('should migrate old config file if it exists', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };
      // .mskills.json exists
      vi.mocked(fs.stat).mockImplementation(async (p) => {
        if (p === mockOldConfigPath) return { isFile: () => true } as any;
        throw { code: 'ENOENT' };
      });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      await loadConfig();

      expect(fs.rename).toHaveBeenCalledWith(mockOldConfigPath, getConfigPath());
    });

    it('should migrate .mskills directory if it exists', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };
      // .mskills/ directory exists
      vi.mocked(fs.stat).mockImplementation(async (p) => {
        if (p === mockDotMskillsDir) return { isDirectory: () => true } as any;
        throw { code: 'ENOENT' };
      });
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      await loadConfig();

      expect(fs.rename).toHaveBeenCalledWith(mockDotMskillsDir, getMskillsDir());
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
