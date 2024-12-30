import { makeAutoObservable } from 'mobx';

class ActionSpaceStore {
    actions = {};
    rules = {};

    constructor() {
        makeAutoObservable(this);
    }

    setAction(uniqueKey, action) {
        this.actions[uniqueKey] = action;
    }

    getAction(uniqueKey) {
        return this.actions[uniqueKey];
    }

    deleteAction(uniqueKey) {
        delete this.actions[uniqueKey];
    }

    setRule(uniqueKey, rule) {
        this.rules[uniqueKey] = rule;
    }

    getRule(uniqueKey) {
        return this.rules[uniqueKey];
    }

    clearActions() {
        this.actions = {};
        this.rules = {};
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;