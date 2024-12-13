import { makeAutoObservable } from 'mobx';

class EntityStore {
    constructor() {
        this.entityCount = 0; // 总实体数量
        this.agentCount = 0; // 智能体数量
        this.agentType = ''; // 智能体类型（单智能体、同构多智能体、异构多智能体）
        this.agentModels = []; // 智能体模型列表
        this.assignedEntities = []; // 已分配的实体
        this.dynamicStructure = []; // 动态结构

        makeAutoObservable(this);
    }

    // 设置总实体数量
    setEntityCount(count) {
        this.entityCount = count;
        this.resetDynamicStructure();
    }

    // 设置智能体数量
    setAgentCount(count) {
        this.agentCount = count;
        this.resetDynamicStructure();
    }

    // 设置智能体类型
    setAgentType(type) {
        this.agentType = type;
        this.resetDynamicStructure();
    }

    // 重置动态结构
    resetDynamicStructure() {
        this.dynamicStructure = [];
        this.assignedEntities = [];
        this.generateDynamicStructure();
    }

    // 生成动态结构
    generateDynamicStructure() {
        if (this.agentCount === 0) {
            this.dynamicStructure = [];
            return;
        }

        if (this.agentType === '单智能体') {
            this.dynamicStructure = [{ agent: '智能体1', entities: this.getEntities(this.entityCount) }];
        } else if (this.agentType === '同构多智能体') {
            const entitiesPerAgent = this.entityCount / this.agentCount;
            for (let i = 0; i < this.agentCount; i++) {
                this.dynamicStructure.push({
                    agent: `智能体${i + 1}`,
                    entities: this.getEntities(entitiesPerAgent, i * entitiesPerAgent)
                });
            }
        } else if (this.agentType === '异构多智能体') {
            let remainingEntities = this.entityCount;
            let n = this.agentCount;

            for (let i = 0; i < this.agentCount - 1; i++) {
                const maxCount = remainingEntities - n + 1;
                const selectedCount = Math.min(maxCount, remainingEntities);
                this.dynamicStructure.push({
                    agent: `智能体${i + 1}`,
                    entities: this.getEntities(selectedCount, this.entityCount - remainingEntities)
                });
                this.assignedEntities.push(selectedCount);
                remainingEntities -= selectedCount;
                n--;
            }

            // 最后一个智能体分配剩余的实体
            this.dynamicStructure.push({
                agent: `智能体${this.agentCount}`,
                entities: this.getEntities(remainingEntities, this.entityCount - remainingEntities)
            });
        }
    }

    // 获取实体列表
    getEntities(count, startIndex = 0) {
        const entities = [];
        for (let i = startIndex; i < startIndex + count; i++) {
            entities.push(`实体${i + 1}`);
        }
        return entities;
    }

    // 根据智能体模型获取实体
    getEntitiesByAgent(agent) {
        const agentData = this.dynamicStructure.find(item => item.agent === agent);
        return agentData ? agentData.entities : [];
    }
}

const entityStore = new EntityStore();
export default entityStore;