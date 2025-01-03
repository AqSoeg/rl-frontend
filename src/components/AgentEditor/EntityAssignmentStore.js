import { makeAutoObservable } from 'mobx';

class EntityAssignmentStore {
    assignedEntities = {};
    selectedAgent = null;
    isAgentSelected = false;
    entityCount = 0;
    entities = [];
    entityNames = [];
    listeners = [];

    constructor() {
        makeAutoObservable(this);
    }

    setAssignedEntities(entities) {
        this.assignedEntities = entities;
        this.notifyListeners();
    }

    updateAssignedEntities(entities) {
        this.assignedEntities = { ...this.assignedEntities, ...entities };
        this.notifyListeners();
    }

    // 设置选中的智能体模型
    setSelectedAgent(agent) {
        this.selectedAgent = agent;
        this.isAgentSelected = true;
        this.notifyListeners();
    }

    resetSelectedAgent() {
        this.selectedAgent = null;
        this.isAgentSelected = false;
        this.notifyListeners();
    }

    clearAssignment() {
        this.assignedEntities = {};
        this.selectedAgent = null;
        this.isAgentSelected = false;
        this.notifyListeners();
    }

    setEntities(entities) {
        this.entities = entities;
        this.entityNames = entities.map(entity => entity.name);
        this.entityCount = entities.length;
        this.notifyListeners();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

const entityAssignmentStore = new EntityAssignmentStore();
export default entityAssignmentStore;