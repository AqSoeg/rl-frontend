// ActionSpace.jsx
import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore'; // 引入实体分配状态管理

const { Option } = Select;

const ActionSpace = ({ entities }) => {
    const [visible, setVisible] = useState(Array(entities.length).fill(false));
    const [selectedAction, setSelectedAction] = useState(Array(entities.length).fill(null));
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
    const [entityTexts, setEntityTexts] = useState(entities.map(entity => entity.name)); // 初始化为实体名称

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
        setSelectedType(selectedAction[index]?.selectedType || null);
        setSelectedOption(selectedAction[index]?.selectedOption || null);
        setMeaning(selectedAction[index]?.meaning || '');
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

        const newSelectedAction = [...selectedAction];
        newSelectedAction[selectedActionIndex] = {
            selectedType: selectedType,
            selectedOption: selectedOption,
            meaning: meaning,
        };
        setSelectedAction(newSelectedAction);

        // 更新显示文本
        const newEntityTexts = [...entityTexts];
        newEntityTexts[selectedActionIndex] = `${selectedOption}`;
        setEntityTexts(newEntityTexts);

        handleSelectChange(selectedActionIndex); // 收起下拉框
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            const newSelectedAction = [...selectedAction];
            newSelectedAction[selectedActionIndex] = null;
            setSelectedAction(newSelectedAction);

            // 更新显示文本
            const newEntityTexts = [...entityTexts];
            newEntityTexts[selectedActionIndex] = null;
            setEntityTexts(newEntityTexts);

            handleSelectChange(selectedActionIndex); // 收起下拉框
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
                    <div key={i} className="dropdown-container"> {/* 添加 key */}
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>{entity.name} {entityTexts[i]}</span> {/* 显示 entity.name + entityTexts[i] */}
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
                                        value={selectedType || selectedAction[i]?.selectedType || null}
                                    >
                                        {Object.keys(entity.actionSpace).map((type, index) => (
                                            <Option key={index} value={type}> {/* 添加 key */}
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
                                        value={selectedOption || selectedAction[i]?.selectedOption || null}
                                        disabled={!selectedType}
                                    >
                                        {selectedType && entity.actionSpace[selectedType].map((option, index) => (
                                            <Option key={index} value={option}> {/* 添加 key */}
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
                                        <Option key="IF ELSE" value="IF ELSE">IF ELSE</Option> {/* 添加 key */}
                                        <Option key="WHILE" value="WHILE">WHILE</Option> {/* 添加 key */}
                                        <Option key="MAX" value="MAX">MAX</Option> {/* 添加 key */}
                                        <Option key="MIN" value="MIN">MIN</Option> {/* 添加 key */}
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