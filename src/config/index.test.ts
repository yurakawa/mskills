import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, saveConfig } from './index.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

vi.mock('node:fs/promises');
vi.mock('node:os', () => ({
  default: {
    homedir: vi.fn(() => '/mock/home'),
  },
}));

describe('Config', () => {
  const mockHomeDir = '/mock/home';
  const mockConfigPath = path.join(mockHomeDir, '.mskills.json');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return default config if file does not exist', async () => {
      (fs.readFile as any).mockRejectedValue({ code: 'ENOENT' });

      const config = await loadConfig();

      expect(config).toEqual({ skills: {}, agents: [] });
    });

    it('should return parsed config if file exists', async () => {
      const mockConfig = { skills: { test: { path: '/path' } }, agents: ['claude'] };
      (fs.readFile as any).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await loadConfig();

      expect(config).toEqual(mockConfig);
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
