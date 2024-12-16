import { useState, useEffect } from 'react';
import { Select, Input, Alert } from 'antd';
import { nanoid } from 'nanoid';
import agentEditorStore from './AgentEditorStore';

const { Option } = Select;

const Sidebar = ({ scenarios, onEntitiesChange }) => {
    const [scenario, setScenario] = useState('');
    const [role, setRole] = useState('');
    const [type, setType] = useState('');
    const [name, setName] = useState('');
    const [version, setVersion] = useState('');
    const [agentCount, setAgentCount] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [agentRoles, setAgentRoles] = useState([]);
    const [modelName, setModelName] = useState('待定');
    const [modelID, setModelID] = useState('xxx');
    const [inputIncomplete, setInputIncomplete] = useState(false);
    const [entityCount, setEntityCount] = useState(0);
    const [selectedEntityCount, setSelectedEntityCount] = useState('');
    const [assignedEntities, setAssignedEntities] = useState([]);

    useEffect(() => {
        const selectedScenario = scenarios.find(s => s.id === scenario);
        setAgentRoles(selectedScenario ? selectedScenario.roles : []);
    }, [scenario, scenarios]);

    const handleScenarioChange = (value) => {
        setScenario(value);
        agentEditorStore.setScenarioID(value);
        setRole('');
        setType('');
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
        setSelectedEntityCount('');
        setAssignedEntities([]);
    };

    const handleRoleChange = (value) => {
        setRole(value);
        agentEditorStore.setAgentRoleID(value);
        setType('');
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
        setSelectedEntityCount('');
        setAssignedEntities([]);

        const selectedRole = agentRoles.find(r => r.id === value);
        if (selectedRole) {
            setEntityCount(selectedRole.entities.length);
        }
    };

    const handleTypeChange = (value) => {
        setType(value);
        agentEditorStore.setAgentType(value);
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
        setSelectedEntityCount('');
        setAssignedEntities([]);
    };

    const handleNameChange = (e) => {
        const newName = e.target.value.slice(0, 10);
        setName(newName);
        agentEditorStore.setAgentName(newName); // 更新 agentName
        if (newName.length >= 10) {
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
        agentEditorStore.setAgentVersion(newVersion); // 更新 agentVersion
        if (newVersion !== e.target.value) {
            alert('版本号只能包含数字和小数点，小数位数不超过两位!');
        }
        checkInputCompleteness(name, newVersion);
    };

    const handleAgentCountChange = (value) => {
        setAgentCount(value);
        setSelectedAgent('');
        setSelectedEntityCount('');
        setAssignedEntities([]);
    };

    const handleAgentChange = (value) => {
        setSelectedAgent(value);
        setSelectedEntityCount('');
        updateModelName(name, version, value);
    };

    const handleEntityCountChange = (value) => {
        setSelectedEntityCount(value);
        assignEntities(value);
    };

    const getAgentTypeOptions = (role) => {
        const selectedRole = agentRoles.find(r => r.id === role);
        if (selectedRole && selectedRole.entities.length === 1) {
            return ['单智能体'];
        } else if (selectedRole && selectedRole.entities.length > 1) {
            return ['单智能体', '同构多智能体', '异构多智能体'];
        }
        return [''];
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

    const getEntityCountOptions = (type, agentCount, assignedEntities) => {
        if (type === '单智能体' || type === '同构多智能体') {
            return [entityCount / agentCount];
        } else if (type === '异构多智能体') {
            const remainingEntities = entityCount - assignedEntities.reduce((sum, count) => sum + count, 0);
            return Array.from({ length: remainingEntities }, (_, i) => (i + 1).toString());
        }
        return [''];
    };

    const assignEntities = (count) => {
        if (type === '单智能体' || type === '同构多智能体') {
            const entities = agentRoles.find(r => r.id === role).entities.slice(0, count);
            onEntitiesChange(entities);
            agentEditorStore.setSelectedEntities(entities); // 更新 selectedEntities
        } else if (type === '异构多智能体') {
            const entities = agentRoles.find(r => r.id === role).entities.slice(assignedEntities.reduce((sum, count) => sum + count, 0), count);
            const newAssignedEntities = [...assignedEntities, count];
            setAssignedEntities(newAssignedEntities);
            onEntitiesChange(entities);
            agentEditorStore.setSelectedEntities(entities); // 更新 selectedEntities
        }
    };

    const checkInputCompleteness = (name, version) => {
        let formattedVersion = version;
        if (!version.includes('.')) {
            formattedVersion += '.0';
        }
        if (name && version) {
            setModelName(`${name} v${formattedVersion}`);
            agentEditorStore.setModelName(`${name} v${formattedVersion}`); // 更新 modelName
            setInputIncomplete(false);
        } else {
            setModelName('待定');
            agentEditorStore.setModelName('待定'); // 更新 modelName
            setInputIncomplete(true);
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
                agentEditorStore.setModelName(`${name} v${formattedVersion}`); // 更新 modelName
            } else if (type === '同构多智能体' || type === '异构多智能体') {
                setModelName(`${name} v${formattedVersion} ${selectedAgent}`);
                agentEditorStore.setModelName(`${name} v${formattedVersion} ${selectedAgent}`); // 更新 modelName
            } else {
                setModelName(`${name} v${formattedVersion}`);
                agentEditorStore.setModelName(`${name} v${formattedVersion}`); // 更新 modelName
            }
        } else {
            setModelName('待定');
            agentEditorStore.setModelName('待定'); // 更新 modelName
        }
    };

    const generateModelID = (scenario, role, type, version, agentCount, timestamp, selectedAgent) => {
        const inputString = `${scenario}${role}${type}${version}${agentCount}${timestamp}${selectedAgent}`;
        const hash = nanoid(16);
        return hash;
    };

    useEffect(() => {
        if (scenario && role && type && version && agentCount && selectedAgent) {
            const timestamp = Date.now();
            const newModelID = generateModelID(scenario, role, type, version, agentCount, timestamp, selectedAgent);
            setModelID(newModelID);
            agentEditorStore.setAgentID(newModelID); // 更新 agentID
        }
    }, [scenario, role, type, version, agentCount, selectedAgent]);

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
                {inputIncomplete && <Alert message="请输入完整的智能体名称和版本号!" type="error" className="mt-2" />}
            </div>
            <div className="sidebar-section">
                <div className="text">智能体数量</div>
                <Select value={agentCount} onChange={handleAgentCountChange} className="w-full">
                    {getAgentCountOptions(type).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
                <div className="text">智能体模型</div>
                <Select value={selectedAgent} onChange={handleAgentChange} className="w-full">
                    {getAgentOptions(agentCount).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
                <div className="text">代理的实体数量</div>
                <Select value={selectedEntityCount} onChange={handleEntityCountChange} className="w-full">
                    {getEntityCountOptions(type, agentCount, assignedEntities).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="text">模型名称：{modelName}</div>
                <div className="text">模型ID：{modelID}</div>
            </div>
        </div>
    );
};

export default Sidebar;