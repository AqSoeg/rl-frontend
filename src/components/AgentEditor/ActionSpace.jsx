import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore';
import actionSpaceStore from './ActionSpaceStore';
import sidebarStore from './SidebarStore';

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
    const [confirmedRuleType, setConfirmedRuleType] = useState({});
    const [confirmedCondition1, setConfirmedCondition1] = useState({});
    const [confirmedCondition2, setConfirmedCondition2] = useState({});
    const [confirmedExecution1, setConfirmedExecution1] = useState({});
    const [confirmedExecution2, setConfirmedExecution2] = useState({});
    const agentType = actionSpaceStore.agentType;

    const initializeActionSpaces = () => {
        if (!entityAssignmentStore.isAgentSelected || !sidebarStore.isSingleAgent) return;

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
        const initialConfirmedRuleType = {};
        const initialConfirmedCondition1 = {};
        const initialConfirmedCondition2 = {};
        const initialConfirmedExecution1 = {};
        const initialConfirmedExecution2 = {};

        actionSpaces.forEach((actionSpace, index) => {
            const entityName = entities.find(entity =>
                entity.actionSpace.some((_, i) => `${entity.name}-${i}` === index)
            )?.name;

            if (entityName) {
                const key = agentType === 1 ? index : `${selectedAgent}-${entityName}-${index}`;
                const storedActionSpace = actionSpaceStore.getActionSpace(agentType === 1 ? null : selectedAgent, entityName, index);

                initialVisible[key] = false;
                initialRuleVisible[key] = false;
                initialRuleType[key] = storedActionSpace?.ruleType || null;
                initialCondition1[key] = storedActionSpace?.condition1 || '';
                initialCondition2[key] = storedActionSpace?.condition2 || '';
                initialExecution1[key] = storedActionSpace?.execution1 || '';
                initialExecution2[key] = storedActionSpace?.execution2 || '';
                initialSelectedOption[key] = storedActionSpace?.options || null;
                initialConfirmedOption[key] = storedActionSpace?.options || null;
                initialIsCancelled[key] = false;
                initialConfirmedRuleType[key] = storedActionSpace?.ruleType || null;
                initialConfirmedCondition1[key] = storedActionSpace?.condition1 || '';
                initialConfirmedCondition2[key] = storedActionSpace?.condition2 || '';
                initialConfirmedExecution1[key] = storedActionSpace?.execution1 || '';
                initialConfirmedExecution2[key] = storedActionSpace?.execution2 || '';

                if (actionSpace && actionSpace[3] && !initialIsCancelled[key]) {
                    initialMeaning[key] = storedActionSpace?.meaning || actionSpace[3];
                    initialConfirmedMeaning[key] = storedActionSpace?.meaning || actionSpace[3];
                } else {
                    initialMeaning[key] = storedActionSpace?.meaning || '';
                    initialConfirmedMeaning[key] = storedActionSpace?.meaning || '';
                }
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
        setConfirmedRuleType(initialConfirmedRuleType);
        setConfirmedCondition1(initialConfirmedCondition1);
        setConfirmedCondition2(initialConfirmedCondition2);
        setConfirmedExecution1(initialConfirmedExecution1);
        setConfirmedExecution2(initialConfirmedExecution2);
    };

    useEffect(() => {
        initializeActionSpaces();
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities, sidebarStore.type]);

    const updateActionSpaceRecord = (entityName, actionIndex) => {
        const actionSpace = entities
            .flatMap(entity => entity.actionSpace)
            [actionIndex];

        if (actionSpace) {
            const key = agentType === 1 ? actionIndex : `${entityAssignmentStore.selectedAgent}-${entityName}-${actionIndex}`;
            const agent = agentType === 1 ? null : entityAssignmentStore.selectedAgent;
            actionSpaceStore.updateActionSpace(
                agent,
                entityName,
                actionIndex,
                actionSpace[0],
                actionSpace[1],
                selectedOption[key] || '',
                meaning[key] || '',
                ruleType[key] || '',
                condition1[key] || '',
                condition2[key] || '',
                execution1[key] || '',
                execution2[key] || ''
            );
        }
    };

    const handleSelectChange = (key) => {
        if (visible[key]) {
            if (selectedOption[key] !== confirmedOption[key] || meaning[key] !== confirmedMeaning[key]) {
                setSelectedOption(prev => ({ ...prev, [key]: confirmedOption[key] }));
                setMeaning(prev => ({ ...prev, [key]: confirmedMeaning[key] }));
            }

            setRuleType(prev => ({ ...prev, [key]: confirmedRuleType[key] || null }));
            setCondition1(prev => ({ ...prev, [key]: confirmedCondition1[key] || '' }));
            setCondition2(prev => ({ ...prev, [key]: confirmedCondition2[key] || '' }));
            setExecution1(prev => ({ ...prev, [key]: confirmedExecution1[key] || '' }));
            setExecution2(prev => ({ ...prev, [key]: confirmedExecution2[key] || '' }));
        }

        setVisible(prev => ({ ...prev, [key]: !prev[key] }));
        setSelectedActionIndex(key);
    };

    const updateActionSpaceStroe = (key) => {
        if (agentType === 1) {
            const entityName = entities.find(entity =>
                entity.actionSpace.some((_, i) => `${entity.name}-${i}` === key)
            )?.name;
            updateActionSpaceRecord(entityName, key);
        } else {
            const [_, entityName, actionIndex] = key.split('-');
            updateActionSpaceRecord(entityName, parseInt(actionIndex, 10));
        }
    };

    const handleOptionChange = (key, value) => {
        setSelectedOption(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleMeaningChange = (key, value) => {
        setMeaning(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleRuleTypeChange = (key, value) => {
        setRuleType(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleCondition1Change = (key, value) => {
        setCondition1(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleCondition2Change = (key, value) => {
        setCondition2(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleExecution1Change = (key, value) => {
        setExecution1(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleExecution2Change = (key, value) => {
        setExecution2(prev => ({ ...prev, [key]: value }));
        updateActionSpaceStroe(key);
    };

    const handleConfirm = (key) => {
        if (!selectedOption[key]) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        setConfirmedOption(prev => ({ ...prev, [key]: selectedOption[key] }));
        setConfirmedMeaning(prev => ({ ...prev, [key]: meaning[key] }));
        setVisible(prev => ({ ...prev, [key]: false }));
    };

    const handleCancel = (key) => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            setSelectedOption(prev => ({ ...prev, [key]: null }));
            setConfirmedOption(prev => ({ ...prev, [key]: null }));
            setMeaning(prev => ({ ...prev, [key]: '' }));
            setConfirmedMeaning(prev => ({ ...prev, [key]: '' }));
            setIsCancelled(prev => ({ ...prev, [key]: true }));
            setVisible(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleRuleClick = (key) => {
        if (!selectedOption[key]) {
            alert('请先选择动作后再设置行为规则！');
            return;
        }

        setRuleType(prev => ({ ...prev, [key]: confirmedRuleType[key] || null }));
        setCondition1(prev => ({ ...prev, [key]: confirmedCondition1[key] || '' }));
        setCondition2(prev => ({ ...prev, [key]: confirmedCondition2[key] || '' }));
        setExecution1(prev => ({ ...prev, [key]: confirmedExecution1[key] || '' }));
        setExecution2(prev => ({ ...prev, [key]: confirmedExecution2[key] || '' }));

        setRuleVisible(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleRuleConfirm = (key) => {
        setConfirmedRuleType(prev => ({ ...prev, [key]: ruleType[key] }));
        setConfirmedCondition1(prev => ({ ...prev, [key]: condition1[key] }));
        setConfirmedCondition2(prev => ({ ...prev, [key]: condition2[key] }));
        setConfirmedExecution1(prev => ({ ...prev, [key]: execution1[key] }));
        setConfirmedExecution2(prev => ({ ...prev, [key]: execution2[key] }));
        setRuleVisible(prev => ({ ...prev, [key]: false }));
    };

    const handleRuleCancel = (key) => {
        const confirmCancel = window.confirm('是否取消该行为规则的设置？');
        if (confirmCancel) {
            setRuleType(prev => ({ ...prev, [key]: null }));
            setCondition1(prev => ({ ...prev, [key]: '' }));
            setCondition2(prev => ({ ...prev, [key]: '' }));
            setExecution1(prev => ({ ...prev, [key]: '' }));
            setExecution2(prev => ({ ...prev, [key]: '' }));
            setRuleVisible(prev => ({ ...prev, [key]: false }));

            // 清空已确认的规则内容
            setConfirmedRuleType(prev => ({ ...prev, [key]: null }));
            setConfirmedCondition1(prev => ({ ...prev, [key]: '' }));
            setConfirmedCondition2(prev => ({ ...prev, [key]: '' }));
            setConfirmedExecution1(prev => ({ ...prev, [key]: '' }));
            setConfirmedExecution2(prev => ({ ...prev, [key]: '' }));
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
                        let uniqueKey;
                        if (agentType === 1) {
                            uniqueKey = `${entityIndex}-${actionIndex}`;
                        } else {
                            uniqueKey = `${entityAssignmentStore.selectedAgent}-${entity.name}-${actionIndex}`;
                        }
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