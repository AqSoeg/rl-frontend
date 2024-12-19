// ActionSpace.jsx
import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore'; // 引入实体分配状态管理

const { Option } = Select;

const ActionSpace = ({ entities }) => {
    const [visible, setVisible] = useState([]);
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [meaning, setMeaning] = useState('');
    const [ruleVisible, setRuleVisible] = useState([]);
    const [ruleType, setRuleType] = useState([]);
    const [condition1, setCondition1] = useState([]);
    const [condition2, setCondition2] = useState([]);
    const [execution1, setExecution1] = useState([]);
    const [execution2, setExecution2] = useState([]);

    useEffect(() => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];

            // 初始化 visible 和 ruleVisible 数组
            const actionSpaces = assignedEntities.flatMap(entity => entity.actionSpace);
            setVisible(Array(actionSpaces.length).fill(false));
            setRuleVisible(Array(actionSpaces.length).fill(false));
            setRuleType(Array(actionSpaces.length).fill(null));
            setCondition1(Array(actionSpaces.length).fill(''));
            setCondition2(Array(actionSpaces.length).fill(''));
            setExecution1(Array(actionSpaces.length).fill(''));
            setExecution2(Array(actionSpaces.length).fill(''));
        } else {
            setVisible([]);
            setRuleVisible([]);
            setRuleType([]);
            setCondition1([]);
            setCondition2([]);
            setExecution1([]);
            setExecution2([]);
        }
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities]);

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedActionIndex(index);
        setSelectedOption(null);
        setMeaning('');
    };

    const handleOptionChange = (value) => {
        setSelectedOption(value);
        const actionSpace = entities.flatMap(entity => entity.actionSpace)[selectedActionIndex];
        const optionMeaning = actionSpace[3] || ''; // 含义从 actionSpace 的第四个元素获取
        setMeaning(optionMeaning);
    };

    const handleConfirm = () => {
        if (!selectedOption) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        // 处理确认逻辑
        console.log('确认选择:', {
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
                {entityAssignmentStore.isAgentSelected && entities.flatMap((entity, entityIndex) =>
                    entity.actionSpace.map((actionSpace, actionIndex) => {
                        const uniqueKey = `${entityIndex}-${actionIndex}`; // 生成唯一的 key
                        return (
                            <div key={uniqueKey} className="dropdown-container">
                                <div className="dropdown-header" onClick={() => handleSelectChange(uniqueKey)}>
                                    <span>{entity.name}：{actionSpace[0]}</span> {/* 显示实体名和动作种类 */}
                                    <div className="button-group">
                                        <Button type="link" className="dropdown-button">
                                            {visible[uniqueKey] ? '▲' : '▼'}
                                        </Button>
                                        <div className="blue-divider"></div>
                                        <div
                                            className={`rule-button ${ruleVisible[uniqueKey] ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRuleClick(uniqueKey);
                                            }}
                                        >
                                            行为规则
                                        </div>
                                    </div>
                                </div>
                                {visible[uniqueKey] && (
                                    <div className="action-container">
                                        <div className="action-row">
                                            <span>动作种类：</span>
                                            <span className="action-type-text">{actionSpace[1]}</span> {/* 显示动作种类文本 */}
                                        </div>
                                        <div className="action-row">
                                            <span>可选动作：</span>
                                            <Select
                                                style={{ width: 200 }}
                                                onChange={handleOptionChange}
                                                value={selectedOption}
                                            >
                                                {actionSpace[2].map((option, optionIndex) => (
                                                    <Option key={optionIndex} value={option}>
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
                                                onChange={(e) => setMeaning(e.target.value)}
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
                                {ruleVisible[uniqueKey] && (
                                    <div className="rule-container">
                                        <div className="rule-row">
                                            <span>规则类型：</span>
                                            <Select
                                                style={{ width: 200 }}
                                                onChange={(value) => handleRuleTypeChange(uniqueKey, value)}
                                                value={ruleType[uniqueKey] || null}
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
                                                value={condition1[uniqueKey]}
                                                onChange={(e) => handleCondition1Change(uniqueKey, e.target.value)}
                                                className="common-input"
                                            />
                                        </div>
                                        <div className="rule-row">
                                            <span>条件2：</span>
                                            <Input
                                                placeholder="单行输入"
                                                value={condition2[uniqueKey]}
                                                onChange={(e) => handleCondition2Change(uniqueKey, e.target.value)}
                                                className="common-input"
                                            />
                                        </div>
                                        <div className="rule-row">
                                            <span>执行内容1：</span>
                                            <Input
                                                placeholder="单行输入"
                                                value={execution1[uniqueKey]}
                                                onChange={(e) => handleExecution1Change(uniqueKey, e.target.value)}
                                                className="common-input"
                                            />
                                        </div>
                                        <div className="rule-row">
                                            <span>执行内容2：</span>
                                            <Input
                                                placeholder="单行输入"
                                                value={execution2[uniqueKey]}
                                                onChange={(e) => handleExecution2Change(uniqueKey, e.target.value)}
                                                className="common-input"
                                            />
                                        </div>
                                        <div className="rule-buttons">
                                            <Button type="primary" onClick={() => handleRuleConfirm(uniqueKey)}>
                                                确定
                                            </Button>
                                            <Button onClick={() => handleRuleCancel(uniqueKey)}>
                                                取消
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ActionSpace;