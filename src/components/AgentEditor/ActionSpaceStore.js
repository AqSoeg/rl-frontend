import { makeAutoObservable } from 'mobx';

class ActionSpaceStore {
    // 使用模型ID作为键，存储每个模型的动作和行为规则
    actionsByModel = {};
    rulesByModel = {};
    listeners = []; // 新增：订阅者列表

    constructor() {
        makeAutoObservable(this);
    }

    // 设置动作配置
    setActionsForModel(modelID, actions) {
        this.actionsByModel[modelID] = actions;
        this.notifyListeners(); // 通知订阅者
    }

    // 获取动作配置
    getActionsForModel(modelID) {
        return this.actionsByModel[modelID] || [];
    }

    // 添加动作
    addActionForModel(modelID, action) {
        if (!this.actionsByModel[modelID]) {
            this.actionsByModel[modelID] = [];
        }
        this.actionsByModel[modelID].push(action);
        this.notifyListeners(); // 通知订阅者
    }

    // 更新动作
    updateActionForModel(modelID, uniqueKey, updatedAction) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            const index = actions.findIndex(action => `${action.entity}：${action.actionType}` === uniqueKey);
            if (index !== -1) {
                actions[index] = updatedAction;
                this.notifyListeners(); // 通知订阅者
            }
        }
    }

    // 删除动作
    deleteActionForModel(modelID, uniqueKey) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            this.actionsByModel[modelID] = actions.filter(action => `${action.entity}：${action.actionType}` !== uniqueKey);
            this.notifyListeners(); // 通知订阅者
        }
    }

    // 设置行为规则
    setRuleForModel(modelID, uniqueKey, rule) {
        if (!this.rulesByModel[modelID]) {
            this.rulesByModel[modelID] = {};
        }
        this.rulesByModel[modelID][uniqueKey] = rule;
        this.notifyListeners(); // 通知订阅者
    }

    // 获取行为规则
    getRuleForModel(modelID, uniqueKey) {
        return this.rulesByModel[modelID]?.[uniqueKey] || null;
    }

    // 清空某个模型的动作和行为规则
    clearActionsAndRulesForModel(modelID) {
        delete this.actionsByModel[modelID];
        delete this.rulesByModel[modelID];
        this.notifyListeners(); // 通知订阅者
    }

    // 新增：订阅状态变化
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // 新增：通知订阅者
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;