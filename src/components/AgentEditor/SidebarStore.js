import { makeAutoObservable } from 'mobx';
import entityAssignmentStore from './EntityAssignmentStore';

class SidebarStore {
    scenario = ''; // 想定场景
    scenarioName = ''; // 想定场景名称
    role = ''; // 智能体角色
    roleName = ''; // 智能体角色名称
    type = ''; // 智能体类型
    name = ''; // 智能体名称
    version = ''; // 智能体版本
    agentCount = ''; // 智能体数量
    selectedAgent = ''; // 智能体模型
    modelID = ''; // 模型ID
    listeners = []; // 订阅者列表

    constructor() {
        makeAutoObservable(this);
    }

    // 设置想定场景
    setScenario(scenario, scenarioName) {
        this.scenario = scenario;
        this.scenarioName = scenarioName;
        this.clearExceptScenario();
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体角色
    setRole(role, roleName) {
        this.role = role;
        this.roleName = roleName;
        this.clearExceptScenarioAndRole();
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体类型
    setType(type) {
        this.type = type;
        this.clearExceptScenarioRoleAndType();
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体名称
    setName(name) {
        this.name = name;
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体版本
    setVersion(version) {
        this.version = version;
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体数量
    setAgentCount(agentCount) {
        this.agentCount = agentCount;
        this.clearExceptScenarioRoleTypeAndAgentCount();
        this.notifyListeners(); // 通知订阅者
    }

    // 设置智能体模型
    setSelectedAgent(selectedAgent) {
        this.selectedAgent = selectedAgent;
        this.notifyListeners(); // 通知订阅者
    }

    // 设置模型ID
    setModelID(modelID) {
        this.modelID = modelID;
        this.notifyListeners(); // 通知订阅者
    }

    // 清空除想定场景外的所有状态
    clearExceptScenario() {
        this.role = '';
        this.roleName = '';
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
        return this.selectedAgent !== '' && this.modelID !== '' && this.modelID !== 'xxx';
    }

    // 订阅状态变化
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // 通知订阅者
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}

const sidebarStore = new SidebarStore();
export default sidebarStore;