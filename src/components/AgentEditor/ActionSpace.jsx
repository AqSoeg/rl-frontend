// ActionSpace.jsx
import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore'; // 引入实体分配状态管理

const { Option } = Select;

const ActionSpace = ({ entities }) => {
    const [visible, setVisible] = useState(Array(entities.length).fill(false));
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [meaning, setMeaning] = useState('');
    const [ruleVisible, setRuleVisible] = useState(Array(entities.length).fill(false));
    const [ruleType, setRuleType] = useState(Array(entities.length).fill(null));
    const [condition1, setCondition1] = useState(Array(entities.length).fill(''));
    const [condition2, setCondition2] = useState(Array(entities.length).fill(''));
    const [execution1, setExecution1] = useState(Array(entities.length).fill(''));
    const [execution2, setExecution2] = useState(Array(entities.length).fill(''));

    useEffect(() => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
            setVisible(Array(assignedEntities.length).fill(false));
        } else {
            setVisible([]);
        }
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities]);

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedActionIndex(index);
        setSelectedType(null);
        setSelectedOption(null);
        setMeaning('');
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setSelectedOption(null); // 重置选中的选项
        setMeaning(''); // 重置含义
    };

    const handleOptionChange = (value) => {
        setSelectedOption(value);
        const optionMeaning = entities[selectedActionIndex]?.actionSpace[selectedType]
            .find((option) => option === value);
        setMeaning(optionMeaning || '');
    };

    const handleConfirm = () => {
        if (!selectedType || !selectedOption) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        // 处理确认逻辑
        console.log('确认选择:', {
            selectedType,
            selectedOption,
            meaning,
        });

        // 收起下拉框
        handleSelectChange(selectedActionIndex);
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            // 重置选择
            setSelectedType(null);
            setSelectedOption(null);
            setMeaning('');

            // 收起下拉框
            handleSelectChange(selectedActionIndex);
        }
    };

    const handleRuleClick = (index) => {
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = !newRuleVisible[index];
        setRuleVisible(newRuleVisible);
    };

    const handleRuleTypeChange = (index, value) => {
        const newRuleType = [...ruleType];
        newRuleType[index] = value;
        setRuleType(newRuleType);
    };

    const handleCondition1Change = (index, value) => {
        const newCondition1 = [...condition1];
        newCondition1[index] = value;
        setCondition1(newCondition1);
    };

    const handleCondition2Change = (index, value) => {
        const newCondition2 = [...condition2];
        newCondition2[index] = value;
        setCondition2(newCondition2);
    };

    const handleExecution1Change = (index, value) => {
        const newExecution1 = [...execution1];
        newExecution1[index] = value;
        setExecution1(newExecution1);
    };

    const handleExecution2Change = (index, value) => {
        const newExecution2 = [...execution2];
        newExecution2[index] = value;
        setExecution2(newExecution2);
    };

    const handleRuleConfirm = (index) => {
        // 处理规则确认逻辑
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = false;
        setRuleVisible(newRuleVisible);
    };

    const handleRuleCancel = (index) => {
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = false;
        setRuleVisible(newRuleVisible);
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={actionLogo} alt="ActionSpace" className="sub-component-logo" />
                <div className="sub-component-title">动作空间</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt="Upload" className="upload-button-logo" />
            </div>
            <div className="dropdown-container-wrapper">
                {entityAssignmentStore.isAgentSelected && entities.map((entity, i) => (
                    <div key={i} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>{entity.name}</span> {/* 仅显示实体名称，不显示用户选择的动作 */}
                            <div className="button-group">
                                <Button type="link" className="dropdown-button">
                                    {visible[i] ? '▲' : '▼'}
                                </Button>
                                <div className="blue-divider"></div>
                                <div
                                    className={`rule-button ${ruleVisible[i] ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRuleClick(i);
                                    }}
                                >
                                    行为规则
                                </div>
                            </div>
                        </div>
                        {visible[i] && (
                            <div className="action-container">
                                <div className="action-row">
                                    <span>动作种类：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={handleTypeChange}
                                        value={selectedType}
                                    >
                                        {Object.keys(entity.actionSpace).map((type, index) => (
                                            <Option key={index} value={type}>
                                                {type}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="action-row">
                                    <span>可选动作：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={handleOptionChange}
                                        value={selectedOption}
                                        disabled={!selectedType}
                                    >
                                        {selectedType && entity.actionSpace[selectedType].map((option, index) => (
                                            <Option key={index} value={option}>
                                                {option}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="action-row">
                                    <span className="meaning-label">含义：</span>
                                    <Input
                                        placeholder={meaning ? meaning : "单行输入"}
                                        value={meaning}
                                        disabled={!selectedOption}
                                        className="meaning-input"
                                    />
                                </div>
                                <div className="action-buttons">
                                    <Button type="primary" onClick={handleConfirm}>
                                        确定
                                    </Button>
                                    <Button onClick={handleCancel}>
                                        取消
                                    </Button>
                                </div>
                            </div>
                        )}
                        {ruleVisible[i] && (
                            <div className="rule-container">
                                <div className="rule-row">
                                    <span>规则类型：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={(value) => handleRuleTypeChange(i, value)}
                                        value={ruleType[i] || null}
                                    >
                                        <Option key="IF ELSE" value="IF ELSE">IF ELSE</Option>
                                        <Option key="WHILE" value="WHILE">WHILE</Option>
                                        <Option key="MAX" value="MAX">MAX</Option>
                                        <Option key="MIN" value="MIN">MIN</Option>
                                    </Select>
                                </div>
                                <div className="rule-row">
                                    <span>条件1：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={condition1[i]}
                                        onChange={(e) => handleCondition1Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>条件2：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={condition2[i]}
                                        onChange={(e) => handleCondition2Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>执行内容1：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={execution1[i]}
                                        onChange={(e) => handleExecution1Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>执行内容2：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={execution2[i]}
                                        onChange={(e) => handleExecution2Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-buttons">
                                    <Button type="primary" onClick={() => handleRuleConfirm(i)}>
                                        确定
                                    </Button>
                                    <Button onClick={() => handleRuleCancel(i)}>
                                        取消
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionSpace;