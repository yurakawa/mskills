import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import { registerExportCommand } from './export.js';
import AdmZip from 'adm-zip';
import fs from 'node:fs/promises';
import { loadConfig, getMskillsDir } from '../config/index.js';
import path from 'node:path';

const mockAddLocalFolder = vi.fn();
const mockWriteZip = vi.fn();

vi.mock('adm-zip', () => {
  return {
    default: function() {
      return {
        addLocalFolder: mockAddLocalFolder,
        writeZip: mockWriteZip,
      };
    }
  };
});
vi.mock('node:fs/promises');
vi.mock('../config/index.js');

describe('export command', () => {
  let program: Command;
  let mockExit: any;
  let mockLog: any;
  let mockError: any;

  beforeEach(() => {
    program = new Command();
    registerExportCommand(program);

    mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockAddLocalFolder.mockClear();
    mockWriteZip.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('export skill', () => {
    it('should show error if skill is not found', async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({ skills: {}, agents: [] });

      await program.parseAsync(['node', 'test', 'export', 'skill', 'non-existent']);

      expect(mockError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should export skill successfully', async () => {
      vi.mocked(loadConfig).mockResolvedValueOnce({
        skills: {
          myskill: { path: '/path/to/myskill' }
        },
        agents: []
      });
      vi.mocked(fs.stat).mockResolvedValueOnce({} as any);

      await program.parseAsync(['node', 'test', 'export', 'skill', 'myskill']);

      expect(mockAddLocalFolder).toHaveBeenCalledWith('/path/to/myskill');
      expect(mockWriteZip).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalled();
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('export config', () => {
    it('should show error if config directory is not found', async () => {
      vi.mocked(getMskillsDir).mockReturnValue('/mock/mskills');
      vi.mocked(fs.stat).mockRejectedValueOnce(new Error('ENOENT'));

      await program.parseAsync(['node', 'test', 'export', 'config']);

      expect(mockError).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should export config successfully', async () => {
      vi.mocked(getMskillsDir).mockReturnValue('/mock/mskills');
      vi.mocked(fs.stat).mockResolvedValueOnce({} as any);

      await program.parseAsync(['node', 'test', 'export', 'config']);

      expect(mockAddLocalFolder).toHaveBeenCalledWith('/mock/mskills');
      expect(mockWriteZip).toHaveBeenCalled();
      expect(mockLog).toHaveBeenCalled();
      expect(mockExit).not.toHaveBeenCalled();
    });
  });
});
