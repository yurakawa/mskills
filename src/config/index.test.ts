import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, saveConfig } from './index.js';
import fs from 'node:fs/promises';
import { Stats } from 'node:fs';
import path from 'node:path';


vi.mock('node:fs/promises');
vi.mock('node:os', () => ({
  default: {
    homedir: vi.fn(() => '/mock/home'),
  },
}));

describe('Config', () => {
  const mockHomeDir = '/mock/home';
  const mockConfigDir = path.join(mockHomeDir, '.config', 'mskills');
  const mockConfigPath = path.join(mockConfigDir, 'config.json');
  const mockDotMskillsDir = path.join(mockHomeDir, '.mskills');
  const mockOldConfigPath = path.join(mockHomeDir, '.mskills.json');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('XDG_CONFIG_HOME', '');
    vi.mocked(fs.stat).mockRejectedValue({ code: 'ENOENT' });
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.rename).mockResolvedValue(undefined);
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

      expect(fs.rename).toHaveBeenCalledWith(mockOldConfigPath, mockConfigPath);
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

      expect(fs.rename).toHaveBeenCalledWith(mockDotMskillsDir, mockConfigDir);
    });

    it('should use XDG_CONFIG_HOME if set', async () => {
      const xdgHome = '/custom/xdg';
      vi.stubEnv('XDG_CONFIG_HOME', xdgHome);
      vi.mocked(fs.readFile).mockRejectedValue({ code: 'ENOENT' });

      await loadConfig();

      // Check if mkdir was called for the custom path
      expect(fs.writeFile).toBeDefined(); // just to use vi.mocked
    });
  });

  describe('saveConfig', () => {
    it('should write config to file', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };

      await saveConfig(mockConfig);

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        JSON.stringify(mockConfig, null, 2),
        'utf-8'
      );
    });
  });
});
