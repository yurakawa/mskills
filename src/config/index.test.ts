import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, saveConfig } from './index.js';
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
  const mockConfigDir = path.join(mockHomeDir, '.mskills');
  const mockConfigPath = path.join(mockConfigDir, 'config.json');
  const mockOldConfigPath = path.join(mockHomeDir, '.mskills.json');

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('should migrate old config if it exists', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };
      // Old file exists
      vi.mocked(fs.stat).mockResolvedValue({ isFile: () => true } as any);
      // New file doesn't exist yet but let's assume migrate moves it
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      await loadConfig();

      expect(fs.rename).toHaveBeenCalledWith(mockOldConfigPath, mockConfigPath);
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
