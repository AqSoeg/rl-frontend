import { makeAutoObservable } from 'mobx';

class ActionSpaceStore {
    actionsByModel = {};
    rulesByModel = {};
    listeners = [];

    constructor() {
        makeAutoObservable(this);
    }

    setActionsForModel(modelID, actions) {
        this.actionsByModel[modelID] = actions;
        this.notifyListeners();
    }

    getActionsForModel(modelID) {
        return this.actionsByModel[modelID] || [];
    }

    addActionForModel(modelID, action) {
        if (!this.actionsByModel[modelID]) {
            this.actionsByModel[modelID] = [];
        }
        this.actionsByModel[modelID].push(action);
        this.notifyListeners();
    }

    updateActionForModel(modelID, uniqueKey, updatedAction) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            const index = actions.findIndex(action => `${action.entity}：${action.actionType}` === uniqueKey);
            if (index !== -1) {
                actions[index] = updatedAction;
                this.notifyListeners();
            }
        }
    }

    deleteActionForModel(modelID, uniqueKey) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            this.actionsByModel[modelID] = actions.filter(action => `${action.entity}：${action.actionType}` !== uniqueKey);
            this.notifyListeners();
        }
    }

    setRuleForModel(modelID, uniqueKey, rule) {
        if (!this.rulesByModel[modelID]) {
            this.rulesByModel[modelID] = {};
        }
        this.rulesByModel[modelID][uniqueKey] = rule;
        this.notifyListeners();
    }

    getRuleForModel(modelID, uniqueKey) {
        return this.rulesByModel[modelID]?.[uniqueKey] || null;
    }

    clearActionsAndRulesForModel(modelID) {
        delete this.actionsByModel[modelID];
        delete this.rulesByModel[modelID];
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

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;