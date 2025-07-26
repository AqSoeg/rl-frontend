import { makeAutoObservable } from 'mobx';

class IntelligentStore {
  selectedScenario = null;
  selectedAgentRole = null;


  constructor() {
    makeAutoObservable(this);
  }

  selectScenario(scenario) {
    this.selectedScenario = scenario;
    this.selectedAgentRole = null;
  }
  
  selectAgentRole(agentRole) {
    this.selectedAgentRole = agentRole;
  }

}

export const intelligentStore = new IntelligentStore();