// ActionSpace.jsx
import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore';

const { Option } = Select;

const ActionSpace = ({ entities }) => {
    const [visible, setVisible] = useState({});
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedOption, setSelectedOption] = useState({});
    const [confirmedOption, setConfirmedOption] = useState({}); // 用于保存确认后的选项
    const [meaning, setMeaning] = useState({});
    const [confirmedMeaning, setConfirmedMeaning] = useState({}); // 用于保存确认后的含义
    const [ruleVisible, setRuleVisible] = useState({});
    const [ruleType, setRuleType] = useState({});
    const [condition1, setCondition1] = useState({});
    const [condition2, setCondition2] = useState({});
    const [execution1, setExecution1] = useState({});
    const [execution2, setExecution2] = useState({});
    const [isCancelled, setIsCancelled] = useState({}); // 用于标记是否取消了某个动作

    useEffect(() => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];

            // 初始化状态
            const actionSpaces = assignedEntities.flatMap(entity => entity.actionSpace);
            const initialVisible = {};
            const initialRuleVisible = {};
            const initialRuleType = {};
            const initialCondition1 = {};
            const initialCondition2 = {};
            const initialExecution1 = {};
            const initialExecution2 = {};
            const initialSelectedOption = {};
            const initialConfirmedOption = {}; // 初始化确认后的选项
            const initialMeaning = {};
            const initialConfirmedMeaning = {}; // 初始化确认后的含义
            const initialIsCancelled = {}; // 初始化取消状态

            actionSpaces.forEach((actionSpace, index) => {
                initialVisible[index] = false;
                initialRuleVisible[index] = false;
                initialRuleType[index] = null;
                initialCondition1[index] = '';
                initialCondition2[index] = '';
                initialExecution1[index] = '';
                initialExecution2[index] = '';
                initialSelectedOption[index] = null;
                initialConfirmedOption[index] = null; // 初始化确认后的选项
                initialIsCancelled[index] = false; // 初始化取消状态为 false

                // 如果 actionSpace[3] 有初始值，且未被取消，则将其加载到 meaning 和 confirmedMeaning 中
                if (actionSpace && actionSpace[3] && !initialIsCancelled[index]) {
                    initialMeaning[index] = actionSpace[3];
                    initialConfirmedMeaning[index] = actionSpace[3];
                } else {
                    initialMeaning[index] = '';
                    initialConfirmedMeaning[index] = '';
                }
            });

            setVisible(initialVisible);
            setRuleVisible(initialRuleVisible);
            setRuleType(initialRuleType);
            setCondition1(initialCondition1);
            setCondition2(initialCondition2);
            setExecution1(initialExecution1);
            setExecution2(initialExecution2);
            setSelectedOption(initialSelectedOption);
            setConfirmedOption(initialConfirmedOption); // 设置确认后的选项
            setMeaning(initialMeaning);
            setConfirmedMeaning(initialConfirmedMeaning); // 设置确认后的含义
            setIsCancelled(initialIsCancelled); // 设置取消状态
        } else {
            setVisible({});
            setRuleVisible({});
            setRuleType({});
            setCondition1({});
            setCondition2({});
            setExecution1({});
            setExecution2({});
            setSelectedOption({});
            setConfirmedOption({}); // 清空确认后的选项
            setMeaning({});
            setConfirmedMeaning({}); // 清空确认后的含义
            setIsCancelled({}); // 清空取消状态
        }
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities]);

    const handleSelectChange = (index) => {
        if (visible[index]) {
            // 如果下拉框正在收起，且用户没有确认，则恢复到确认的状态
            if (selectedOption[index] !== confirmedOption[index] || meaning[index] !== confirmedMeaning[index]) {
                setSelectedOption(prev => ({ ...prev, [index]: confirmedOption[index] }));
                setMeaning(prev => ({ ...prev, [index]: confirmedMeaning[index] }));
            }
        }
        setVisible(prev => ({ ...prev, [index]: !prev[index] }));
        setSelectedActionIndex(index);
    };

    const handleOptionChange = (index, value) => {
        setSelectedOption(prev => ({ ...prev, [index]: value }));

        // 获取当前动作空间
        const actionSpace = entities.flatMap(entity => entity.actionSpace)[index];

        // 防御性检查：确保 actionSpace 存在且有足够的元素
        if (actionSpace && actionSpace.length > 3) {
            const optionMeaning = actionSpace[3] || '';
            setMeaning(prev => ({ ...prev, [index]: optionMeaning }));
        } else {
            setMeaning(prev => ({ ...prev, [index]: '' })); // 如果 actionSpace 不存在或元素不足，清空含义
        }
    };

    const handleConfirm = (index) => {
        if (!selectedOption[index]) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        // 保存确认后的选项和含义
        setConfirmedOption(prev => ({ ...prev, [index]: selectedOption[index] }));
        setConfirmedMeaning(prev => ({ ...prev, [index]: meaning[index] }));

        // 收起下拉框
        setVisible(prev => ({ ...prev, [index]: false }));
    };

    const handleCancel = (index) => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            setSelectedOption(prev => ({ ...prev, [index]: null }));
            setConfirmedOption(prev => ({ ...prev, [index]: null })); // 取消时清空确认后的选项
            setMeaning(prev => ({ ...prev, [index]: '' }));
            setConfirmedMeaning(prev => ({ ...prev, [index]: '' })); // 取消时清空确认后的含义
            setIsCancelled(prev => ({ ...prev, [index]: true })); // 标记为已取消
            setVisible(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleRuleClick = (index) => {
        if (!selectedOption[index]) {
            alert('请先选择动作后再设置行为规则！');
            return;
        }
        setRuleVisible(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleRuleTypeChange = (index, value) => {
        setRuleType(prev => ({ ...prev, [index]: value }));
    };

    const handleCondition1Change = (index, value) => {
        setCondition1(prev => ({ ...prev, [index]: value }));
    };

    const handleCondition2Change = (index, value) => {
        setCondition2(prev => ({ ...prev, [index]: value }));
    };

    const handleExecution1Change = (index, value) => {
        setExecution1(prev => ({ ...prev, [index]: value }));
    };

    const handleExecution2Change = (index, value) => {
        setExecution2(prev => ({ ...prev, [index]: value }));
    };

    const handleRuleConfirm = (index) => {
        // 处理规则确认逻辑
        setRuleVisible(prev => ({ ...prev, [index]: false }));
    };

    const handleRuleCancel = (index) => {
        const confirmCancel = window.confirm('是否取消该行为规则的设置？');
        if (confirmCancel) {
            setRuleType(prev => ({ ...prev, [index]: null }));
            setCondition1(prev => ({ ...prev, [index]: '' }));
            setCondition2(prev => ({ ...prev, [index]: '' }));
            setExecution1(prev => ({ ...prev, [index]: '' }));
            setExecution2(prev => ({ ...prev, [index]: '' }));
            setRuleVisible(prev => ({ ...prev, [index]: false }));
        }
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
                        const uniqueKey = `${entityIndex}-${actionIndex}`;
                        const initialMeaningValue = actionSpace[3] || ''; // 获取初始含义值

                        return (
                            <div key={uniqueKey} className="dropdown-container">
                                <div className="dropdown-header" onClick={() => handleSelectChange(uniqueKey)}>
                                    <span>{entity.name}：{actionSpace[0]}</span>
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
                                            <span className="action-type-text">{actionSpace[1]}</span>
                                        </div>
                                        <div className="action-row">
                                            <span>可选动作：</span>
                                            <Select
                                                style={{ width: 200 }}
                                                onChange={(value) => handleOptionChange(uniqueKey, value)}
                                                value={selectedOption[uniqueKey] || confirmedOption[uniqueKey]} // 显示未确认的选项或确认后的选项
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
                                                placeholder={!isCancelled[uniqueKey] && initialMeaningValue ? "" : "单行输入"} // 如果未取消且有初始值，不显示 placeholder
                                                value={meaning[uniqueKey] || confirmedMeaning[uniqueKey] || (!isCancelled[uniqueKey] ? initialMeaningValue : '')} // 如果未取消，显示初始值；否则显示空
                                                onChange={(e) => setMeaning(prev => ({ ...prev, [uniqueKey]: e.target.value }))}
                                                className="meaning-input"
                                            />
                                        </div>
                                        <div className="action-buttons">
                                            <Button type="primary" onClick={() => handleConfirm(uniqueKey)}>
                                                确定
                                            </Button>
                                            <Button onClick={() => handleCancel(uniqueKey)}>
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