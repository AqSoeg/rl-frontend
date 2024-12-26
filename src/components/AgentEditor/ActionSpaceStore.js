import { makeAutoObservable } from 'mobx';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';

class ActionSpaceStore {
    actionSpaces = {}; // 存储每个智能体的动作空间信息，结构为 { agentName: { entityName: { actionIndex: { ... } } } }
    agentType = null; // 智能体类型：0（单智能体）、1（同构多智能体）、2（异构多智能体）

    constructor() {
        makeAutoObservable(this);

        // 订阅 SidebarStore 中的智能体类型变化
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

        // 订阅 EntityAssignmentStore 中的实体分配变化
        entityAssignmentStore.subscribe(() => {
            const assignedEntities = entityAssignmentStore.assignedEntities;
            if (this.agentType === 0) return; // 如果是单智能体，不处理

            // 同构多智能体：同步所有实体的动作空间
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

            // 异构多智能体：为每个智能体单独记录动作空间
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

    // 更新动作空间信息
    updateActionSpace(agentName, entityName, actionIndex, actionName, actionType, options, meaning, ruleType, condition1, condition2, execution1, execution2) {
        if (this.agentType === 1) {
            // 同构多智能体：同步更新所有实体的动作空间
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
            // 单智能体或异构多智能体：仅更新当前智能体和实体的动作空间
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

    // 清空动作空间信息
    clearActionSpaces() {
        this.actionSpaces = {};
    }

    // 获取动作空间信息
    getActionSpace(agentName, entityName, actionIndex) {
        return this.actionSpaces[agentName]?.[entityName]?.[actionIndex];
    }
}

const actionSpaceStore = new ActionSpaceStore();
export default actionSpaceStore;