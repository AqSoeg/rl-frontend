import { makeAutoObservable } from 'mobx';
import entityAssignmentStore from './EntityAssignmentStore';
import rewardFunctionStore from './RewardFunctionStore'; // 引入 RewardFunctionStore

class SidebarStore {
    scenario = ''; // 想定场景
    role = ''; // 智能体角色
    type = ''; // 智能体类型
    name = ''; // 智能体名称
    version = ''; // 智能体版本
    agentCount = ''; // 智能体数量
    selectedAgent = ''; // 智能体模型
    modelID = ''; // 模型ID

    constructor() {
        makeAutoObservable(this);
    }

    // 设置想定场景
    setScenario(scenario) {
        this.scenario = scenario;
        this.clearExceptScenario();
        rewardFunctionStore.clearRewards(); // 清空奖励函数状态
    }

    // 设置智能体角色
    setRole(role) {
        this.role = role;
        this.clearExceptScenarioAndRole();
        rewardFunctionStore.clearRewards(); // 清空奖励函数状态
    }

    // 设置智能体类型
    setType(type) {
        this.type = type;
        this.clearExceptScenarioRoleAndType();
        rewardFunctionStore.clearRewards(); // 清空奖励函数状态
    }

    // 设置智能体名称
    setName(name) {
        this.name = name;
    }

    // 设置智能体版本
    setVersion(version) {
        this.version = version;
    }

    // 设置智能体数量
    setAgentCount(agentCount) {
        this.agentCount = agentCount;
        this.clearExceptScenarioRoleTypeAndAgentCount();
        rewardFunctionStore.clearRewards(); // 清空奖励函数状态
    }

    // 设置智能体模型
    setSelectedAgent(selectedAgent) {
        this.selectedAgent = selectedAgent;
    }

    // 设置模型ID
    setModelID(modelID) {
        this.modelID = modelID;
    }

    // 清空除想定场景外的所有状态
    clearExceptScenario() {
        this.role = '';
        this.type = '';
        this.name = '';
        this.version = '';
        this.agentCount = '';
        this.selectedAgent = '';
        this.modelID = '';
        entityAssignmentStore.clearAssignment();
    }

    // 清空除想定场景和智能体角色外的所有状态
    clearExceptScenarioAndRole() {
        this.type = '';
        this.name = '';
        this.version = '';
        this.agentCount = '';
        this.selectedAgent = '';
        this.modelID = '';
        entityAssignmentStore.clearAssignment();
    }

    // 清空除想定场景、智能体角色和类型外的所有状态
    clearExceptScenarioRoleAndType() {
        this.agentCount = '';
        this.selectedAgent = '';
        this.modelID = '';
        entityAssignmentStore.clearAssignment();
    }

    // 清空除想定场景、智能体角色、类型和智能体数量外的所有状态
    clearExceptScenarioRoleTypeAndAgentCount() {
        this.selectedAgent = '';
        this.modelID = '';
        entityAssignmentStore.clearAssignment();
    }

    // 检查是否可以保存模型
    canSaveModel() {
        return this.selectedAgent !== '' && this.modelID !== '';
    }
}

const sidebarStore = new SidebarStore();
export default sidebarStore;