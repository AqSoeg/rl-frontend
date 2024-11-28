import { useState, useEffect } from 'react';
import { Select, Input, Alert } from 'antd';
import { nanoid } from 'nanoid'; // 使用 nanoid 生成唯一ID
import './AgentEditor.css'; // 引入 CSS 文件

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
    const [modelID, setModelID] = useState('xxx');
    const [versionError, setVersionError] = useState('');
    const [nameError, setNameError] = useState('');
    const [inputIncomplete, setInputIncomplete] = useState(false);

    useEffect(() => {
        const selectedScenario = scenarios.find(s => s.name === scenario);
        setAgentRoles(selectedScenario ? selectedScenario.agentRoles : []);
    }, [scenario, scenarios]);

    const handleScenarioChange = (value) => {
        setScenario(value);
        setRole('');
        setType('');
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
    };

    const handleRoleChange = (value) => {
        setRole(value);
        setType('');
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
    };

    const handleTypeChange = (value) => {
        setType(value);
        setName('');
        setVersion('');
        setAgentCount('');
        setSelectedAgent('');
    };

    const handleNameChange = (e) => {
        const newName = e.target.value.slice(0, 10);
        setName(newName);
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
        if (newVersion !== e.target.value) {
            alert('版本号只能包含数字和小数点，小数位数不超过两位!');
        }
        checkInputCompleteness(name, newVersion);
    };

    const handleAgentCountChange = (value) => {
        setAgentCount(value);
        setSelectedAgent('');
    };

    const handleAgentChange = (value) => {
        setSelectedAgent(value);
        updateModelName(name, version, value);
    };

    const getAgentTypeOptions = (role) => {
        const selectedRole = agentRoles.find(r => r.name === role);
        if (selectedRole && selectedRole.count === 1) {
            return ['单智能体'];
        } else if (selectedRole && selectedRole.count > 1) {
            return ['单智能体', '同构多智能体', '异构多智能体'];
        }
        return [''];
    };

    const getAgentCountOptions = (type) => {
        if (type === '单智能体') {
            return ['1'];
        } else if (type === '同构多智能体' || type === '异构多智能体') {
            const selectedRole = agentRoles.find(r => r.name === role);
            if (selectedRole) {
                return [...Array.from({ length: selectedRole.count }, (_, i) => (i + 1).toString())];
            }
        }
        return [''];
    };

    const getAgentOptions = (agentCount) => {
        if (agentCount) {
            return [...Array.from({ length: parseInt(agentCount) }, (_, i) => `智能体${i + 1}`)];
        }
        return [''];
    };

    const checkInputCompleteness = (name, version) => {
        let formattedVersion = version;
        if (!version.includes('.')) {
            formattedVersion += '.0';
        }
        if (name && version) {
            setModelName(`${name} v${formattedVersion}`);
            setInputIncomplete(false);
        } else {
            setModelName('待定');
            setInputIncomplete(true);
        }
    };

    const updateModelName = (name, version, selectedAgent) => {
        let formattedVersion = version;
        if (!version.includes('.')) {
            formattedVersion += '.0';
        }
        if (name && version) {
            if (type === '同构多智能体' || type === '异构多智能体') {
                setModelName(`${name} v${formattedVersion} ${selectedAgent}`);
            } else {
                setModelName(`${name} v${formattedVersion}`);
            }
        } else {
            setModelName('待定');
        }
    };

    const generateModelID = (scenario, role, type, version, agentCount, timestamp, selectedAgent) => {
        const inputString = `${scenario}${role}${type}${version}${agentCount}${timestamp}${selectedAgent}`;
        const hash = nanoid(16); // 生成16位的唯一ID
        return hash;
    };

    useEffect(() => {
        if (scenario && role && type && version && agentCount && selectedAgent) {
            const timestamp = Date.now();
            const newModelID = generateModelID(scenario, role, type, version, agentCount, timestamp, selectedAgent);
            setModelID(newModelID);
        }
    }, [scenario, role, type, version, agentCount, selectedAgent]);

    return (
        <div className="sidebar">
            <div className="sidebar-section">
                <div className="font-bold mb-2">想定场景</div>
                <Select value={scenario} onChange={handleScenarioChange} className="w-full">
                    {scenarios.map((scenario) => (
                        <Option key={scenario.name} value={scenario.name}>{scenario.name}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="font-bold mb-2">智能体角色/功能</div>
                <Select value={role} onChange={handleRoleChange} className="w-full">
                    {agentRoles.map((role) => (
                        <Option key={role.name} value={role.name}>{role.name}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="font-bold mb-2">智能体类型</div>
                <Select value={type} onChange={handleTypeChange} className="w-full">
                    {getAgentTypeOptions(role).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="font-bold mb-2">智能体名称</div>
                <Input
                    value={name}
                    onChange={handleNameChange}
                    placeholder="请不要超过10个字"
                    className="w-full"
                />
                <div className="font-bold mb-2">版本</div>
                <Input
                    value={version}
                    onChange={handleVersionChange}
                    placeholder="请输出实数，小数位数不超过两位"
                    className="w-full"
                />
                {inputIncomplete && <Alert message="请输入完整的智能体名称和版本号!" type="error" className="mt-2" />}
            </div>
            <div className="sidebar-section">
                <div className="font-bold mb-2">智能体数量</div>
                <Select value={agentCount} onChange={handleAgentCountChange} className="w-full">
                    {getAgentCountOptions(type).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
                <div className="font-bold mb-2">智能体模型</div>
                <Select value={selectedAgent} onChange={handleAgentChange} className="w-full">
                    {getAgentOptions(agentCount).map((option) => (
                        <Option key={option} value={option}>{option}</Option>
                    ))}
                </Select>
            </div>
            <div className="sidebar-section">
                <div className="font-bold mb-2">模型名称：{modelName}</div>
                <div className="font-bold mb-2">模型ID：{modelID}</div>
            </div>
        </div>
    );
};

export default Sidebar;