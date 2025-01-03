import { makeAutoObservable } from 'mobx';

class EntityAssignmentStore {
    assignedEntities = {}; // 存储分配的实体
    selectedAgent = null; // 当前选中的智能体模型
    isAgentSelected = false; // 是否已经选择了智能体模型
    entityCount = 0; // 实体数量
    entities = []; // 实体列表
    listeners = []; // 订阅者列表

    constructor() {
        makeAutoObservable(this);
    }

    // 设置分配的实体
    setAssignedEntities(entities) {
        this.assignedEntities = entities;
        this.notifyListeners(); // 通知订阅者
    }

    // 更新分配的实体（智能体数量不变时）
    updateAssignedEntities(entities) {
        this.assignedEntities = { ...this.assignedEntities, ...entities };
        this.notifyListeners(); // 通知订阅者
    }

    // 设置选中的智能体模型
    setSelectedAgent(agent) {
        this.selectedAgent = agent;
        this.isAgentSelected = true; // 当选择智能体模型时，设置为 true
        this.notifyListeners(); // 通知订阅者
    }

    // 重置选中的智能体模型
    resetSelectedAgent() {
        this.selectedAgent = null;
        this.isAgentSelected = false; // 重置为未选择状态
        this.notifyListeners(); // 通知订阅者
    }

    // 清空分配状态
    clearAssignment() {
        this.assignedEntities = {};
        this.selectedAgent = null;
        this.isAgentSelected = false; // 清空时重置为 false
        this.notifyListeners(); // 通知订阅者
    }

    // 设置实体数量
    setEntityCount(count) {
        this.entityCount = count;
        this.notifyListeners(); // 通知订阅者
    }

    // 设置实体列表
    setEntities(entities) {
        this.entities = entities;
        this.notifyListeners(); // 通知订阅者
    }

    // 订阅状态变化
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // 通知订阅者
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

const entityAssignmentStore = new EntityAssignmentStore();
export default entityAssignmentStore;