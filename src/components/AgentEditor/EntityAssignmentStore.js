import { makeAutoObservable } from 'mobx';
import sidebarStore from './SidebarStore';

class EntityAssignmentStore {
    assignedEntities = {};
    selectedAgent = null;
    isAgentSelected = false;
    entityCount = 0;
    entities = [];
    entityNames = [];
    listeners = [];
    agentEntityMapping = [];

    constructor() {
        makeAutoObservable(this);
    }

    setAssignedEntities(entities) {
        this.assignedEntities = entities;
        this.updateAgentEntityMapping();
        this.notifyListeners();
    }

    updateAssignedEntities(entities) {
        this.assignedEntities = { ...this.assignedEntities, ...entities };
        this.updateAgentEntityMapping();
        this.notifyListeners();
    }

    updateAgentEntityMapping() {
        if (sidebarStore.type === '同构多智能体') {
            const agentCount = sidebarStore.agentCount;
            const entitiesPerAgent = this.entityCount / agentCount;

            this.agentEntityMapping = [];

            for (let i = 0; i < entitiesPerAgent; i++) {
                const mapping = {};
                for (let agentIndex = 1; agentIndex <= agentCount; agentIndex++) {
                    const agent = `智能体${agentIndex}`;
                    const entity = this.assignedEntities[agent]?.[i];
                    if (entity) {
                        mapping[entity] = agent;
                    }
                }
                this.agentEntityMapping.push(mapping);
            }
        } else {
            this.agentEntityMapping = [];
        }
    }

    setSelectedAgent(agent) {
        this.selectedAgent = agent;
        this.isAgentSelected = true;
        this.notifyListeners();
    }

    resetSelectedAgent() {
        this.selectedAgent = null;
        this.isAgentSelected = false;
        this.notifyListeners();
    }

    clearAssignment() {
        this.assignedEntities = {};
        this.selectedAgent = null;
        this.isAgentSelected = false;
        this.agentEntityMapping = [];
        this.notifyListeners();
    }

    setEntities(entities) {
        this.entities = entities;
        this.entityNames = entities.map(entity => entity.name);
        this.entityCount = entities.length;
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

const entityAssignmentStore = new EntityAssignmentStore();
export default entityAssignmentStore;