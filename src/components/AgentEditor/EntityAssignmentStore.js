// EntityAssignmentStore.js
import { makeAutoObservable } from 'mobx';

class EntityAssignmentStore {
    assignedEntities = {}; // 存储分配的实体
    selectedAgent = null; // 当前选中的智能体模型
    isAgentSelected = false; // 是否已经选择了智能体模型
    listeners = []; // 订阅者列表

    constructor() {
        makeAutoObservable(this);
    }

    setAssignedEntities(entities) {
        this.assignedEntities = entities;
        this.notifyListeners(); // 通知订阅者
    }

    setSelectedAgent(agent) {
        this.selectedAgent = agent;
        this.isAgentSelected = true; // 当选择智能体模型时，设置为 true
        this.notifyListeners(); // 通知订阅者
    }

    clearAssignment() {
        this.assignedEntities = {};
        this.selectedAgent = null;
        this.isAgentSelected = false; // 清空时重置为 false
        this.notifyListeners(); // 通知订阅者
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