import { makeAutoObservable } from 'mobx';

class IntelligentStore {
  selectedAgent = null;
  selectedScenario = null;
  selectedAlgorithm = null;
  selectedAgentRole = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadAgent(agent) {
    this.selectedAgent = agent;
  }

  selectScenario(scenario) {
    this.selectedScenario = scenario;
    this.selectedAgentRole = null; 
  }

  selectAlgorithm(algorithm) {
    this.selectedAlgorithm = algorithm;
  }

  selectAgentRole(agentRole) {
    this.selectedAgentRole = agentRole;
  }
}

export const intelligentStore = new IntelligentStore();