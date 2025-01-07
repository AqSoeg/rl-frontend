import { makeAutoObservable } from 'mobx';

class IntelligentStore {
  selectedAgent = null;
  selectedScenario = null;
  selectedAlgorithm = null;
  selectedAgentRole = null;
  algorithmType = ''; // 新增算法类型状态
  algorithmsByType = []; // 新增算法列表状态

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

  setAlgorithmType(type) { // 新增方法
    this.algorithmType = type;
    this.algorithmsByType = []; // 重置算法列表
    this.selectedAlgorithm = null; // 重置具体算法选择
  }

  setAlgorithmsByType(algorithms) { // 新增方法
    this.algorithmsByType = algorithms;
  }
}

export const intelligentStore = new IntelligentStore();