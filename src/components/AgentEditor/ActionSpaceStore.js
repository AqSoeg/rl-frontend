import { makeAutoObservable, reaction } from 'mobx';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';

class ActionSpaceStore {
    actionSpaces = {}; // 存储每个智能体的动作空间信息，结构为 { agentName: { entityName: { actionIndex: { ... } } } }
    isSingleAgent = false; // 是否选择了单智能体
    isHomogeneousMultiAgent = false; // 是否选择了同构多智能体
    isHeterogeneousMultiAgent = false; // 是否选择了异构多智能体

    constructor() {
        makeAutoObservable(this);

        // 监听 SidebarStore 中的智能体类型变化
        reaction(
            () => sidebarStore.type,
            (type) => {
                this.isSingleAgent = type === '单智能体';
                this.isHomogeneousMultiAgent = type === '同构多智能体';
                this.isHeterogeneousMultiAgent = type === '异构多智能体';
            }
        );

        // 监听实体分配变化
        reaction(
            () => entityAssignmentStore.assignedEntities,
            (assignedEntities) => {
                if (this.isSingleAgent) return; // 如果是单智能体，不处理

                // 同构多智能体：同步所有实体的动作空间
                if (this.isHomogeneousMultiAgent) {
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
                if (this.isHeterogeneousMultiAgent) {
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
            }
        );
    }

    // 更新动作空间信息
    updateActionSpace(agentName, entityName, actionIndex, actionName, actionType, options, meaning, ruleType, condition1, condition2, execution1, execution2) {
        if (this.isHomogeneousMultiAgent) {
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
        } else if (this.isSingleAgent || this.isHeterogeneousMultiAgent) {
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