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
                this.setRuleForModel(modelID, uniqueKey, null);
                this.notifyListeners();
            }
        }
    }

    deleteActionForModel(modelID, uniqueKey) {
        const actions = this.actionsByModel[modelID];
        if (actions) {
            this.actionsByModel[modelID] = actions.filter(action => `${action.entity}：${action.actionType}` !== uniqueKey);
            this.setRuleForModel(modelID, uniqueKey, null);
            this.notifyListeners();
        }
    }

    setRuleForModel(modelID, uniqueKey, rule, ruleNumber) {
        if (!this.rulesByModel[modelID]) {
            this.rulesByModel[modelID] = {};
        }

        const ruleKey = ruleNumber ? `${uniqueKey}_${ruleNumber}` : uniqueKey;

        if (rule) {
            this.rulesByModel[modelID][ruleKey] = {
                ...rule,
                uniqueKey,
                ruleNumber
            };
        } else {
            if (ruleNumber) {
                delete this.rulesByModel[modelID][ruleKey];
            } else {
                Object.keys(this.rulesByModel[modelID]).forEach(key => {
                    if (key.startsWith(`${uniqueKey}_`)) {
                        delete this.rulesByModel[modelID][key];
                    }
                });
            }
        }
        this.notifyListeners();
    }

    getRuleForModel(modelID, uniqueKey, ruleNumber) {
        if (ruleNumber) {
            return this.rulesByModel[modelID]?.[`${uniqueKey}_${ruleNumber}`] || null;
        }
        const rules = Object.entries(this.rulesByModel[modelID] || {})
            .filter(([key]) => key.startsWith(`${uniqueKey}_`))
            .map(([_, rule]) => rule);

        return rules.length > 0 ? rules[0] : null;
    }

    getAllRulesForAction(modelID, uniqueKey) {
        return Object.entries(this.rulesByModel[modelID] || {})
            .filter(([key]) => key.startsWith(`${uniqueKey}_`))
            .map(([_, rule]) => rule)
            .sort((a, b) => a.ruleNumber - b.ruleNumber);
    }

    getNextRuleNumber(modelID, uniqueKey) {
        const rules = this.getAllRulesForAction(modelID, uniqueKey);
        return rules.length > 0 ? Math.max(...rules.map(rule => rule.ruleNumber)) + 1 : 1;
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