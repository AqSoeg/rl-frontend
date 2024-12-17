import { makeAutoObservable } from 'mobx';

class AgentEditorStore {
    scenarioID = '';
    agentRoleID = '';
    agentType = '';
    agentName = ''; // 用于保存 agentName
    agentVersion = '';
    agentID = '';
    updateTime = '';
    modelName = ''; // 用于保存 Sidebar.jsx 中的 modelName
    selectedEntities = []; // 新增：用于记录用户选择的实体
    isEntityCountEmpty = true; // 新增：用于跟踪代理的实体数量是否为空

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

    setAgentName(agentName) {
        this.agentName = agentName;
    }

    setAgentVersion(agentVersion) {
        this.agentVersion = agentVersion;
    }

    setAgentID(agentID) {
        this.agentID = agentID;
    }

    setUpdateTime(updateTime) {
        this.updateTime = updateTime;
    }

    setModelName(modelName) { // 新增方法，用于设置 Sidebar.jsx 中的 modelName
        this.modelName = modelName;
    }

    setSelectedEntities(entities) { // 新增方法，用于设置用户选择的实体
        this.selectedEntities = entities;
        this.isEntityCountEmpty = entities.length === 0; // 更新 isEntityCountEmpty 状态
    }

    saveModel = () => {
        // 检查 isEntityCountEmpty 状态
        if (this.isEntityCountEmpty) {
            alert('代理的实体数量不能为空，请选择实体后再保存模型！');
            return;
        }

        // 弹出确认弹窗
        const isConfirmed = window.confirm('是否确认保存模型？');

        if (isConfirmed) {
            const modelData = {
                scenarioID: this.scenarioID,
                agentRoleID: this.agentRoleID,
                agentType: this.agentType,
                agentName: this.agentName,
                agentVersion: this.agentVersion,
                agentID: this.agentID,
                updateTime: new Date().toISOString(),
                entities: this.selectedEntities, // 新增：包含用户选择的实体
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
                    alert(`${this.modelName} 已保存成功！`); // 使用 Sidebar.jsx 中的 modelName
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                alert('Failed to save model. Please try again.');
            };
        } else {
            alert('保存操作已取消！');
        }
    };
}

const agentEditorStore = new AgentEditorStore();
export default agentEditorStore;