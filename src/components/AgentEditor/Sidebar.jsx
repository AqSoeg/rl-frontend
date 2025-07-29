import { useState, useEffect } from 'react';
import { Select, Input, Button } from 'antd';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';
import EntityAssignmentModal from './EntityAssignmentModal';

const { Option } = Select;

const Sidebar = ({ scenarios }) => {
    const [scenario, setScenario] = useState('');
    const [role, setRole] = useState('');
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [version, setVersion] = useState('');
    const [agentCount, setAgentCount] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [agentRoles, setAgentRoles] = useState([]);
    const [modelName, setModelName] = useState('待定');
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = sidebarStore.subscribe(() => {
            setScenario(sidebarStore.scenario);
            setRole(sidebarStore.role);
            setType(sidebarStore.type);
            setName(sidebarStore.name);
            setVersion(sidebarStore.version);
            setAgentCount(sidebarStore.agentCount);
            setSelectedAgent(sidebarStore.selectedAgent);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        checkInputCompleteness(name, version);
        updateModelName(name, version, selectedAgent);
    }, [name, version, selectedAgent]);

    useEffect(() => {
        const selectedScenario = scenarios.find(s => s.id === scenario);
        setAgentRoles(selectedScenario ? selectedScenario.roles : []);
    }, [scenario, scenarios]);

    useEffect(() => {
        if (sidebarStore.isLoadingModel) {
            sidebarStore.setLoadingModel(false);
            return;
        }
        if (scenario && role && type && version && agentCount) {
            sidebarStore.setModelID(scenario, role, type, version, agentCount);
        } else {
            sidebarStore.setModelID('', '', '', '', '');
        }
    }, [scenario, role, type, version, agentCount]);

    const handleScenarioChange = (value) => {
        const selectedScenario = scenarios.find(s => s.id === value);
        setScenario(value);
        setRole('');
        setType('');
        setAgentCount('');
        setSelectedAgent('');
        entityAssignmentStore.clearAssignment();
        sidebarStore.setScenario(value, selectedScenario.name);
    };

    const handleRoleChange = (value) => {
        const selectedRole = agentRoles.find(r => r.id === value);
        setRole(value);
        setType('');
        setAgentCount('');
        setSelectedAgent('');
        entityAssignmentStore.clearAssignment();
        sidebarStore.setRole(value, selectedRole.name);

        if (selectedRole) {
            entityAssignmentStore.setEntities(selectedRole.entities);
        }
    };

    const handleTypeChange = (value) => {
        setType(value);
        setAgentCount('');
        setSelectedAgent('');
        entityAssignmentStore.clearAssignment();
        sidebarStore.setType(value);
    };

    const handleNameChange = (e) => {
        const newName = e.target.value.slice(0, 50);
        setName(newName);
        sidebarStore.setName(newName);
        if (newName.length >= 50) {
            alert('名称不能超过10个字符!');
        }
        checkInputCompleteness(newName, version);
    };

    const handleVersionChange = (e) => {
        let newVersion = e.target.value.replace(/[^0-9.]/g, '');
        if (newVersion.includes('.')) {
            const parts = newVersion.split('.');
            newVersion = parts[0] + '.' + parts[1].split('.')[0].slice(0, 2);
        }
        setVersion(newVersion);
        sidebarStore.setVersion(newVersion);
        if (newVersion !== e.target.value) {
            alert('版本号只能包含数字和小数点，小数位数不超过两位!');
        }
        checkInputCompleteness(name, newVersion);
    };

    const handleAgentCountChange = (value) => {
        setAgentCount(value);
        setSelectedAgent('');
        entityAssignmentStore.clearAssignment();
        sidebarStore.setAgentCount(value);
    };

    const handleAgentChange = (value) => {
        if (Object.keys(entityAssignmentStore.assignedEntities).length > 0) {
            setSelectedAgent(value);
            entityAssignmentStore.setSelectedAgent(value);
            sidebarStore.setSelectedAgent(value);
            updateModelName(name, version, value);
        } else {
            alert('请先分配实体后再选择智能体模型！');
        }
    };

    const getAgentTypeOptions = (role) => {
        const selectedRole = agentRoles.find(r => r.id === role);
        if (selectedRole) {
            if (selectedRole.agentTypes?.length) {
                return selectedRole.agentTypes;
            }
            if (selectedRole.entities.length === 1) {
                return ['单智能体'];
            } else if (selectedRole.entities.length > 1) {
                return ['单智能体', '同构多智能体', '异构多智能体'];
            }
        }
        return [];
    };

    const getAgentCountOptions = (type) => {
        if (type === '单智能体') {
            return ['1'];
        } else if (type === '同构多智能体') {
            const selectedRole = agentRoles.find(r => r.id === role);
            if (selectedRole) {
                const entityCount = selectedRole.entities.length;
                const factors = getFactors(entityCount);
                return factors.map(factor => factor.toString());
            }
        } else if (type === '异构多智能体') {
            const selectedRole = agentRoles.find(r => r.id === role);
            if (selectedRole) {
                const entityCount = selectedRole.entities.length;
                return Array.from({ length: entityCount - 1 }, (_, i) => (i + 2).toString());
            }
        }
        return [''];
    };

    const getFactors = (number) => {
        const factors = [];
        for (let i = 2; i <= number; i++) {
            if (number % i === 0) {
                factors.push(i);
            }
        }
        return factors;
    };

    const getAgentOptions = (agentCount) => {
        if (agentCount) {
            return [...Array.from({ length: parseInt(agentCount) }, (_, i) => `智能体${i + 1}`)];
        }
        return [''];
    };

    const assignEntities = () => {
        setModalOpen(true);
    };

    const handleModalConfirm = (selectedEntities) => {
        if (Object.keys(entityAssignmentStore.assignedEntities).length > 0) {
            entityAssignmentStore.updateAssignedEntities(selectedEntities);
        } else {
            entityAssignmentStore.setAssignedEntities(selectedEntities);
        }
        entityAssignmentStore.resetSelectedAgent();
        setSelectedAgent('');
        setModalOpen(false);
    };

    const handleModalCancel = () => {
        setModalOpen(false);
    };

    const checkInputCompleteness = (name, version) => {
        let formattedVersion = version;
        if (!version.includes('.')) {
            formattedVersion += '.0';
        }
        if (name && version) {
            setModelName(`${name} v${formattedVersion}`);
        } else {
            setModelName('待定');
        }
    };

    const updateModelName = (name, version, selectedAgent) => {
        let formattedVersion = version;
        if (!version.includes('.')) {
            formattedVersion += '.0';
        }
        if (name && version) {
            if (agentCount === '1') {
                setModelName(`${name} v${formattedVersion}`);
            } else if (type === '同构多智能体' || type === '异构多智能体') {
                setModelName(`${name} v${formattedVersion} ${selectedAgent}`);
            } else {
                setModelName(`${name} v${formattedVersion}`);
            }
        } else {
            setModelName('待定');
        }
    };

    const getRenderedModelID = () => {
        if (sidebarStore.version && sidebarStore.modelID && selectedAgent) {
            const agentNumber = selectedAgent.replace('智能体', '');
            return `${sidebarStore.modelID}-${agentNumber}`;
        }
        return 'xxx';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <div className="text">想定场景</div>
                <Select value={scenario} onChange={handleScenarioChange} className="w-full">
                    {scenarios.map((scenario) => (
                        <Option key={scenario.id} value={scenario.id}>{scenario.name}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="text">智能体角色/功能</div>
                <Select value={role} onChange={handleRoleChange} className="w-full">
                    {agentRoles.map((role) => (
                        <Option key={role.id} value={role.id}>{role.name}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="text">智能体类型</div>
                <Select value={type} onChange={handleTypeChange} className="w-full">
                    {getAgentTypeOptions(role).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="text">智能体名称</div>
                <Input
                    value={name}
                    onChange={handleNameChange}
                    placeholder="请不要超过10个字"
                    className="w-full"
                />
                <div className="text">版本</div>
                <Input
                    value={version}
                    onChange={handleVersionChange}
                    placeholder="请输出实数"
                    className="w-full"
                />
            </div>
            <div className="sidebar-section">
                <div className="text">智能体数量</div>
                <Select value={agentCount} onChange={handleAgentCountChange} className="w-full">
                    {getAgentCountOptions(type).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
                <Button
                    type="primary"
                    onClick={assignEntities}
                    disabled={!agentCount}
                    className="mt-2"
                >
                    分配实体
                </Button>
                <div className="text">智能体模型</div>
                <Select value={selectedAgent} onChange={handleAgentChange} className="w-full" disabled={Object.keys(entityAssignmentStore.assignedEntities).length === 0}>
                    {getAgentOptions(agentCount).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="text">模型名称：{modelName}</div>
                <div className="text">模型ID：{getRenderedModelID()}</div>
            </div>

            <EntityAssignmentModal
                open={modalOpen}
                onCancel={handleModalCancel}
                onConfirm={handleModalConfirm}
            />
        </div>
    );
};

export default Sidebar;