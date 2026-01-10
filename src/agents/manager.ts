import { loadConfig, saveConfig } from '../config/index.js';
import { SUPPORTED_AGENTS } from './base.js';

export class AgentManager {
  async enable(name: string) {
    if (!SUPPORTED_AGENTS[name]) {
      throw new Error(`Agent '${name}' is not supported. Supported agents: ${Object.keys(SUPPORTED_AGENTS).join(', ')}`);
    }

    const config = await loadConfig();
    if (!config.agents.includes(name)) {
      config.agents.push(name);
      await saveConfig(config);
    }
  }

  async disable(name: string) {
    const config = await loadConfig();
    config.agents = config.agents.filter((a) => a !== name);
    await saveConfig(config);
  }

  async listEnabled() {
    const config = await loadConfig();
    return config.agents;
  }
  
  listSupported() {
    return Object.keys(SUPPORTED_AGENTS);
  }
}

export const agentManager = new AgentManager();
