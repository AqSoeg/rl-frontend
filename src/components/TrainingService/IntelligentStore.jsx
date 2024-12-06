import { makeAutoObservable } from 'mobx';

class IntelligentStore {
  selectedAgent = null;

  constructor() {
    makeAutoObservable(this);
  }

  loadAgent(agent) {
    this.selectedAgent = agent;
  }
}

export const intelligentStore = new IntelligentStore();