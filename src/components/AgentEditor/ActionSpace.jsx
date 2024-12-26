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

    // 初始化动作空间
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
                const storedActionSpace = actionSpaceStore.getActionSpace(entityName, index);

                initialVisible[index] = false;
                initialRuleVisible[index] = false;
                initialRuleType[index] = storedActionSpace?.ruleType || null;
                initialCondition1[index] = storedActionSpace?.condition1 || '';
                initialCondition2[index] = storedActionSpace?.condition2 || '';
                initialExecution1[index] = storedActionSpace?.execution1 || '';
                initialExecution2[index] = storedActionSpace?.execution2 || '';
                initialSelectedOption[index] = storedActionSpace?.options || null;
                initialConfirmedOption[index] = storedActionSpace?.options || null;
                initialIsCancelled[index] = false;
                initialConfirmedRuleType[index] = storedActionSpace?.ruleType || null;
                initialConfirmedCondition1[index] = storedActionSpace?.condition1 || '';
                initialConfirmedCondition2[index] = storedActionSpace?.condition2 || '';
                initialConfirmedExecution1[index] = storedActionSpace?.execution1 || '';
                initialConfirmedExecution2[index] = storedActionSpace?.execution2 || '';

                if (actionSpace && actionSpace[3] && !initialIsCancelled[index]) {
                    initialMeaning[index] = storedActionSpace?.meaning || actionSpace[3];
                    initialConfirmedMeaning[index] = storedActionSpace?.meaning || actionSpace[3];
                } else {
                    initialMeaning[index] = storedActionSpace?.meaning || '';
                    initialConfirmedMeaning[index] = storedActionSpace?.meaning || '';
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

    // 监听实体分配和智能体类型变化
    useEffect(() => {
        initializeActionSpaces();
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities, sidebarStore.type]);

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
                selectedOption[actionIndex] || '', // 可选动作
                meaning[actionIndex] || '', // 含义
                ruleType[actionIndex] || '', // 规则类型
                condition1[actionIndex] || '', // 条件1
                condition2[actionIndex] || '', // 条件2
                execution1[actionIndex] || '', // 执行1
                execution2[actionIndex] || '' // 执行2
            );
        }
    };

    // 处理下拉框选择
    const handleSelectChange = (index) => {
        if (visible[index]) {
            if (selectedOption[index] !== confirmedOption[index] || meaning[index] !== confirmedMeaning[index]) {
                setSelectedOption(prev => ({ ...prev, [index]: confirmedOption[index] }));
                setMeaning(prev => ({ ...prev, [index]: confirmedMeaning[index] }));
            }

            // 重置未确认的行为规则更改
            setRuleType(prev => ({ ...prev, [index]: confirmedRuleType[index] || null }));
            setCondition1(prev => ({ ...prev, [index]: confirmedCondition1[index] || '' }));
            setCondition2(prev => ({ ...prev, [index]: confirmedCondition2[index] || '' }));
            setExecution1(prev => ({ ...prev, [index]: confirmedExecution1[index] || '' }));
            setExecution2(prev => ({ ...prev, [index]: confirmedExecution2[index] || '' }));
        }

        setVisible(prev => ({ ...prev, [index]: !prev[index] }));
        setSelectedActionIndex(index);
    };

    // 处理选项更改
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

    // 处理含义更改
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

    // 处理规则类型更改
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

    // 处理条件1更改
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

    // 处理条件2更改
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

    // 处理执行1更改
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

    // 处理执行2更改
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

    // 处理确认
    const handleConfirm = (index) => {
        if (!selectedOption[index]) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        setConfirmedOption(prev => ({ ...prev, [index]: selectedOption[index] }));
        setConfirmedMeaning(prev => ({ ...prev, [index]: meaning[index] }));
        setVisible(prev => ({ ...prev, [index]: false }));
    };

    // 处理取消
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

    // 处理规则点击
    const handleRuleClick = (index) => {
        if (!selectedOption[index]) {
            alert('请先选择动作后再设置行为规则！');
            return;
        }

        // 重置未确认的更改
        setRuleType(prev => ({ ...prev, [index]: confirmedRuleType[index] || null }));
        setCondition1(prev => ({ ...prev, [index]: confirmedCondition1[index] || '' }));
        setCondition2(prev => ({ ...prev, [index]: confirmedCondition2[index] || '' }));
        setExecution1(prev => ({ ...prev, [index]: confirmedExecution1[index] || '' }));
        setExecution2(prev => ({ ...prev, [index]: confirmedExecution2[index] || '' }));

        setRuleVisible(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // 处理规则确认
    const handleRuleConfirm = (index) => {
        setConfirmedRuleType(prev => ({ ...prev, [index]: ruleType[index] }));
        setConfirmedCondition1(prev => ({ ...prev, [index]: condition1[index] }));
        setConfirmedCondition2(prev => ({ ...prev, [index]: condition2[index] }));
        setConfirmedExecution1(prev => ({ ...prev, [index]: execution1[index] }));
        setConfirmedExecution2(prev => ({ ...prev, [index]: execution2[index] }));
        setRuleVisible(prev => ({ ...prev, [index]: false }));
    };

    // 处理规则取消
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