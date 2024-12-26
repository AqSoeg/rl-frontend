// ActionSpace.jsx
import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore';
import actionSpaceStore from './ActionSpaceStore'; // 引入 ActionSpaceStore

const { Option } = Select;

const ActionSpace = ({ entities }) => {
    const [visible, setVisible] = useState({});
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedOption, setSelectedOption] = useState({});
    const [confirmedOption, setConfirmedOption] = useState({});
    const [meaning, setMeaning] = useState({});
    const [confirmedMeaning, setConfirmedMeaning] = useState({});
    const [ruleVisible, setRuleVisible] = useState({});
    const [ruleType, setRuleType] = useState({});
    const [condition1, setCondition1] = useState({});
    const [condition2, setCondition2] = useState({});
    const [execution1, setExecution1] = useState({});
    const [execution2, setExecution2] = useState({});
    const [isCancelled, setIsCancelled] = useState({});

    useEffect(() => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];

            const actionSpaces = assignedEntities.flatMap(entity => entity.actionSpace);
            const initialVisible = {};
            const initialRuleVisible = {};
            const initialRuleType = {};
            const initialCondition1 = {};
            const initialCondition2 = {};
            const initialExecution1 = {};
            const initialExecution2 = {};
            const initialSelectedOption = {};
            const initialConfirmedOption = {};
            const initialMeaning = {};
            const initialConfirmedMeaning = {};
            const initialIsCancelled = {};

            actionSpaces.forEach((actionSpace, index) => {
                initialVisible[index] = false;
                initialRuleVisible[index] = false;
                initialRuleType[index] = null;
                initialCondition1[index] = '';
                initialCondition2[index] = '';
                initialExecution1[index] = '';
                initialExecution2[index] = '';
                initialSelectedOption[index] = null;
                initialConfirmedOption[index] = null;
                initialIsCancelled[index] = false;

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
            setConfirmedOption(initialConfirmedOption);
            setMeaning(initialMeaning);
            setConfirmedMeaning(initialConfirmedMeaning);
            setIsCancelled(initialIsCancelled);
        } else {
            setVisible({});
            setRuleVisible({});
            setRuleType({});
            setCondition1({});
            setCondition2({});
            setExecution1({});
            setExecution2({});
            setSelectedOption({});
            setConfirmedOption({});
            setMeaning({});
            setConfirmedMeaning({});
            setIsCancelled({});
        }
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities]);

    // 实时更新 ActionSpaceStore 中的记录
    const updateActionSpaceRecord = (entityName, actionIndex) => {
        const actionSpace = entities
            .flatMap(entity => entity.actionSpace)
            [actionIndex];

        if (actionSpace) {
            actionSpaceStore.updateActionSpace(
                entityName,
                actionIndex,
                actionSpace[0], // 动作名称
                actionSpace[1], // 动作种类
                actionSpace[2], // 可选动作
                meaning[actionIndex] || '', // 含义
                ruleType[actionIndex] || '', // 规则类型
                condition1[actionIndex] || '', // 条件1
                condition2[actionIndex] || '', // 条件2
                execution1[actionIndex] || '', // 执行1
                execution2[actionIndex] || '' // 执行2
            );
        }
    };

    const handleSelectChange = (index) => {
        if (visible[index]) {
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

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleMeaningChange = (index, value) => {
        setMeaning(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleRuleTypeChange = (index, value) => {
        setRuleType(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleCondition1Change = (index, value) => {
        setCondition1(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleCondition2Change = (index, value) => {
        setCondition2(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleExecution1Change = (index, value) => {
        setExecution1(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleExecution2Change = (index, value) => {
        setExecution2(prev => ({ ...prev, [index]: value }));

        // 获取实体名称
        const entityName = entities.find(entity =>
            entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
        )?.name;

        if (entityName) {
            updateActionSpaceRecord(entityName, index);
        }
    };

    const handleConfirm = (index) => {
        if (!selectedOption[index]) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        setConfirmedOption(prev => ({ ...prev, [index]: selectedOption[index] }));
        setConfirmedMeaning(prev => ({ ...prev, [index]: meaning[index] }));
        setVisible(prev => ({ ...prev, [index]: false }));
    };

    const handleCancel = (index) => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            setSelectedOption(prev => ({ ...prev, [index]: null }));
            setConfirmedOption(prev => ({ ...prev, [index]: null }));
            setMeaning(prev => ({ ...prev, [index]: '' }));
            setConfirmedMeaning(prev => ({ ...prev, [index]: '' }));
            setIsCancelled(prev => ({ ...prev, [index]: true }));
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

    const handleRuleConfirm = (index) => {
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
                        const initialMeaningValue = actionSpace[3] || '';

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
                                                value={selectedOption[uniqueKey] || confirmedOption[uniqueKey]}
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
                                                placeholder={!isCancelled[uniqueKey] && initialMeaningValue ? "" : "单行输入"}
                                                value={meaning[uniqueKey] || confirmedMeaning[uniqueKey] || (!isCancelled[uniqueKey] ? initialMeaningValue : '')}
                                                onChange={(e) => handleMeaningChange(uniqueKey, e.target.value)}
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