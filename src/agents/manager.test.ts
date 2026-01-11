import { describe, it, expect, vi, beforeEach } from 'vitest';
import { agentManager } from './manager.js';
import * as configModule from '../config/index.js';

vi.mock('../config/index.js');

describe('AgentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(configModule.loadConfig).mockResolvedValue({ skills: {}, agents: [] });
  });

  describe('enable', () => {
    it('should enable a supported agent', async () => {
      await agentManager.enable('claude');

      expect(configModule.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        agents: ['claude']
      }));
    });

    it('should throw error for unsupported agent', async () => {
      await expect(agentManager.enable('unsupported-agent')).rejects.toThrow();
    });
  });

  describe('disable', () => {
    it('should disable an agent', async () => {
      vi.mocked(configModule.loadConfig).mockResolvedValue({
        skills: {},
        agents: ['claude', 'gemini']
      });

      await agentManager.disable('claude');

      expect(configModule.saveConfig).toHaveBeenCalledWith(expect.objectContaining({
        agents: ['gemini']
      }));
    });
  });
});
