import { makeAutoObservable } from 'mobx';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';

class ActionSpaceStore {
    actionSpaces = {};
    agentType = null;

    constructor() {
        makeAutoObservable(this);

        sidebarStore.subscribe(() => {
            switch (sidebarStore.type) {
                case '单智能体':
                    this.agentType = 0;
                    break;
                case '同构多智能体':
                    this.agentType = 1;
                    break;
                case '异构多智能体':
                    this.agentType = 2;
                    break;
                default:
                    this.agentType = null;
            }
        });

        entityAssignmentStore.subscribe(() => {
            const assignedEntities = entityAssignmentStore.assignedEntities;
            if (this.agentType === 0) return;

            if (this.agentType === 1) {
                const selectedAgent = entityAssignmentStore.selectedAgent;
                if (selectedAgent) {
                    const entities = assignedEntities[selectedAgent] || [];
                    entities.forEach(entity => {
                        if (!this.actionSpaces[entity.name]) {
                            this.actionSpaces[entity.name] = [];
                        }
                    });
                }
            }

            if (this.agentType === 2) {
                Object.keys(assignedEntities).forEach(agentName => {
                    if (!this.actionSpaces[agentName]) {
                        this.actionSpaces[agentName] = {};
                    }
                    const entities = assignedEntities[agentName] || [];
                    entities.forEach(entity => {
                        if (!this.actionSpaces[agentName][entity.name]) {
                            this.actionSpaces[agentName][entity.name] = [];
                        }
                    });
                });
            }
        });
    }

    updateActionSpace(agentName, entityName, actionIndex, actionName, actionType, options, meaning, ruleType, condition1, condition2, execution1, execution2) {
        if (this.agentType === 1) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const entities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
            entities.forEach(entity => {
                if (!this.actionSpaces[entity.name]) {
                    this.actionSpaces[entity.name] = [];
                }
                this.actionSpaces[entity.name][actionIndex] = {
                    actionName,
                    actionType,
                    options,
                    meaning,
                    ruleType,
                    condition1,
                    condition2,
                    execution1,
                    execution2,
                };
            });
        } else if (this.agentType === 0 || this.agentType === 2) {
            if (!this.actionSpaces[agentName]) {
                this.actionSpaces[agentName] = {};
            }
            if (!this.actionSpaces[agentName][entityName]) {
                this.actionSpaces[agentName][entityName] = [];
            }
            this.actionSpaces[agentName][entityName][actionIndex] = {
                actionName,
                actionType,
                options,
                meaning,
                ruleType,
                condition1,
                condition2,
                execution1,
                execution2,
            };
        }
    }

    clearActionSpaces() {
        this.actionSpaces = {};
    }

    getActionSpace(agentName, entityName, actionIndex) {
        return this.actionSpaces[agentName]?.[entityName]?.[actionIndex];
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;