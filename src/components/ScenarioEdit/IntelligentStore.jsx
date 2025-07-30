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

  setupdataparams(data) {
    this.selectedScenario.env_params = data; // 保存加载的离线数据集
  }

}

export const intelligentStore = new IntelligentStore();