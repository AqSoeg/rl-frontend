// AgentEditorStore.js
import { makeAutoObservable } from 'mobx';

class AgentEditorStore {
    scenarioID = '';
    agentRoleID = '';
    agentType = '';
    modelName = '';
    modelVersion = '';
    modelID = '';
    updateTime = '';

    constructor() {
        makeAutoObservable(this);
    }

    setScenarioID(scenarioID) {
        this.scenarioID = scenarioID;
    }

    setAgentRoleID(agentRoleID) {
        this.agentRoleID = agentRoleID;
    }

    setAgentType(agentType) {
        this.agentType = agentType;
    }

    setModelName(modelName) {
        this.modelName = modelName;
    }

    setModelVersion(modelVersion) {
        this.modelVersion = modelVersion;
    }

    setModelID(modelID) {
        this.modelID = modelID;
    }

    setUpdateTime(updateTime) {
        this.updateTime = updateTime;
    }

    saveModel = () => {
        const modelData = {
            scenarioID: this.scenarioID,
            agentRoleID: this.agentRoleID,
            agentType: this.agentType,
            modelName: this.modelName,
            modelVersion: this.modelVersion,
            modelID: this.modelID,
            updateTime: new Date().toISOString(),
        };

        // 通过 WebSocket 发送数据到服务器
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            console.log('WebSocket connection established');
            socket.send(JSON.stringify(modelData));
        };

        socket.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log('Server response:', response);
            if (response.status === 'success') {
                alert('Model saved successfully!');
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            alert('Failed to save model. Please try again.');
        };
    };
}

const agentEditorStore = new AgentEditorStore();
export default agentEditorStore;