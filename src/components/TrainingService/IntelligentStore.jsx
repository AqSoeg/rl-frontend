import { makeAutoObservable } from 'mobx';

class IntelligentStore {
  selectedAgent = null;
  selectedScenario = null;
  selectedAlgorithm = null;
  selectedAgentRole = null;
  algorithmType = ''; // 算法类型状态
  algorithmsByType = []; // 算法列表状态
  trainingMode = 'online'; // 默认训练方式为在线
  selectedDataset = null; // 存储加载的离线数据集

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

  setAlgorithmType(type) {
    this.algorithmType = type;
    this.algorithmsByType = [];
    this.selectedAlgorithm = null;
  }

  setAlgorithmsByType(algorithms) {
    this.algorithmsByType = algorithms;
  }

  setTrainingMode(mode) {
    this.trainingMode = mode; // 更新训练方式
  }

  setSelectedDataset(dataset) {
    this.selectedDataset = dataset; // 保存加载的离线数据集
  }

    setupdataparams(data) {
    this.selectedScenario.env_params = data; // 保存加载的离线数据集
  } 
}

export const intelligentStore = new IntelligentStore();