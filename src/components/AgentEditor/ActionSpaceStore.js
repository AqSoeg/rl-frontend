import { makeAutoObservable } from 'mobx';

class ActionSpaceStore {
    // 使用模型ID作为键，存储每个模型的动作和行为规则
    actionsByModel = {};
    rulesByModel = {};

    constructor() {
        makeAutoObservable(this);
    }

    // 设置动作配置
    setActionsForModel(modelID, actions) {
        this.actionsByModel[modelID] = actions;
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
    }

    // 更新动作
    updateActionForModel(modelID, uniqueKey, updatedAction) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            const index = actions.findIndex(action => `${action.entity}：${action.actionType}` === uniqueKey);
            if (index !== -1) {
                actions[index] = updatedAction;
            }
        }
    }

    // 删除动作
    deleteActionForModel(modelID, uniqueKey) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            this.actionsByModel[modelID] = actions.filter(action => `${action.entity}：${action.actionType}` !== uniqueKey);
        }
    }

    // 设置行为规则
    setRuleForModel(modelID, uniqueKey, rule) {
        if (!this.rulesByModel[modelID]) {
            this.rulesByModel[modelID] = {};
        }
        this.rulesByModel[modelID][uniqueKey] = rule;
    }

    // 获取行为规则
    getRuleForModel(modelID, uniqueKey) {
        return this.rulesByModel[modelID]?.[uniqueKey] || null;
    }

    // 清空某个模型的动作和行为规则
    clearActionsAndRulesForModel(modelID) {
        delete this.actionsByModel[modelID];
        delete this.rulesByModel[modelID];
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;