import { makeAutoObservable } from 'mobx';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';

class StateVectorStore {
    selectedStateVectors = {};
    communicationEntities = {};
    showCommunication = {};

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedStateVectors(selectedStateVectors) {
        this.selectedStateVectors = selectedStateVectors;
    }

    getSelectedStateVectors() {
        return this.selectedStateVectors;
    }

    toggleCommunication(agent) {
        if (sidebarStore.type === '同构多智能体') {
            const newState = !this.showCommunication[agent] || false;
            const agentCount = sidebarStore.agentCount;
            for (let i = 1; i <= agentCount; i++) {
                const agentKey = `智能体${i}`;
                this.showCommunication[agentKey] = newState;
            }
        } else if (sidebarStore.type === '异构多智能体') {
            this.showCommunication[agent] = !this.showCommunication[agent] || false;
        }
    }

    getCommunicationEntities(agent) {
        if (!this.showCommunication[agent]) {
            return [];
        }

        const allEntities = entityAssignmentStore.entities;
        const assignedEntities = entityAssignmentStore.assignedEntities[agent] || [];
        const communicationEntities = allEntities.filter(
            entity => !assignedEntities.includes(entity.name)
        ).map(entity => ({
            ...entity,
            name: `通信-${entity.name}`,
            isCommunication: true
        }));

        return communicationEntities;
    }
}

const stateVectorStore = new StateVectorStore();
export default stateVectorStore;