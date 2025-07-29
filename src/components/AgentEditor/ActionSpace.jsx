import { useState, useEffect } from 'react';
import { Button, Select, Input, Modal } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import addLogo from "../../assets/add.svg";
import entityAssignmentStore from './EntityAssignmentStore';
import sidebarStore from "./SidebarStore";
import actionSpaceStore from './ActionSpaceStore';

const { Option } = Select;

const ActionSpace = ({ entities, selectedParams }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState('');
    const [selectedActionType, setSelectedActionType] = useState('');
    const [actionMode, setActionMode] = useState('');
    const [upperLimit, setUpperLimit] = useState('');
    const [lowerLimit, setLowerLimit] = useState('');
    const [discreteValues, setDiscreteValues] = useState([]);
    const [isAddButtonEnabled, setIsAddButtonEnabled] = useState(false);
    const [editingUniqueKey, setEditingUniqueKey] = useState(null);
    const [actions, setActions] = useState([]);

    const currentModelID = entityAssignmentStore.selectedAgent;

    useEffect(() => {
        const updateActions = () => {
            setActions(actionSpaceStore.getActionsForModel(currentModelID));
        };

        updateActions();
        const unsubscribe = actionSpaceStore.subscribe(updateActions);
        return () => unsubscribe();
    }, [currentModelID]);

    const getActionUnit = () => {
        if (!selectedEntity || !selectedActionType) return '';
        const entity = entities.find(e => e.name === selectedEntity);
        const action = entity?.actionTypes?.find(type => type[0] === selectedActionType);
        return action ? action[1] : '';
    };

    const getActionRange = () => {
        if (!selectedEntity || !selectedActionType) return [];
        const entity = entities.find(e => e.name === selectedEntity);
        const action = entity?.actionTypes?.find(type => type[0] === selectedActionType);
        return action ? action[2] : [];
    };

    const getActionDiscreteValues = () => {
        if (!selectedEntity || !selectedActionType) return [];
        const entity = entities.find(e => e.name === selectedEntity);
        const action = entity?.actionTypes?.find(type => type[0] === selectedActionType);
        return action ? action[3] : [];
    };

    useEffect(() => {
        const unsubscribe = entityAssignmentStore.subscribe(() => {
            setIsAddButtonEnabled(!!entityAssignmentStore.selectedAgent);
        });

        setIsAddButtonEnabled(!!entityAssignmentStore.selectedAgent);

        return () => unsubscribe();
    }, []);

    const handleAddAction = () => {
        setSelectedEntity('');
        setSelectedActionType('');
        setActionMode('');
        setUpperLimit('');
        setLowerLimit('');
        setDiscreteValues([]);
        setEditingUniqueKey(null);
        setModalOpen(true);
    };

    const handleModalConfirm = () => {
        if (actionMode === '离散型' && discreteValues.length === 0) {
            alert('请确保该动作有数值！');
            return;
        }

        if (actionMode === '连续型' && (upperLimit.trim() === '' || lowerLimit.trim() === '')) {
            alert('请确保该动作的上限和下限都有数值！');
            return;
        }

        const uniqueKey = `${selectedEntity}：${selectedActionType}`;
        const action = {
            entity: selectedEntity,
            actionType: selectedActionType,
            mode: actionMode,
            upperLimit,
            lowerLimit,
            discreteValues,
            unit: getActionUnit(),
            range: getActionRange(),
            discreteOptions: getActionDiscreteValues(),
        };

        if (editingUniqueKey) {
            actionSpaceStore.setRuleForModel(currentModelID, editingUniqueKey, null);
            actionSpaceStore.updateActionForModel(currentModelID, editingUniqueKey, action);
        } else {
            const existingAction = actions.find(a => `${a.entity}：${a.actionType}` === uniqueKey);
            if (existingAction) {
                actionSpaceStore.setRuleForModel(currentModelID, uniqueKey, null);
                actionSpaceStore.updateActionForModel(currentModelID, uniqueKey, action);
            } else {
                actionSpaceStore.addActionForModel(currentModelID, action);
            }
        }

        if (sidebarStore.type === '同构多智能体') {
            const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
            const entityGroup = agentEntityMapping.find(group =>
                Object.keys(group).some(entityName => entityName === selectedEntity)
            );

            if (entityGroup) {
                Object.entries(entityGroup).forEach(([entityName, agentName]) => {
                    if (entityName !== selectedEntity) {
                        const syncUniqueKey = `${entityName}：${selectedActionType}`;
                        const syncAction = {
                            entity: entityName,
                            actionType: selectedActionType,
                            mode: actionMode,
                            upperLimit,
                            lowerLimit,
                            discreteValues,
                            unit: getActionUnit(),
                            range: getActionRange(),
                            discreteOptions: getActionDiscreteValues(),
                        };
                        const existingSyncAction = actionSpaceStore
                            .getActionsForModel(agentName)
                            .find(a => `${a.entity}：${a.actionType}` === syncUniqueKey);

                        if (existingSyncAction) {
                            actionSpaceStore.updateActionForModel(agentName, syncUniqueKey, syncAction);
                        } else {
                            actionSpaceStore.addActionForModel(agentName, syncAction);
                        }
                    }
                });
            }
        }

        setModalOpen(false);
    };

    const handleEditAction = (uniqueKey) => {
        const action = actions.find(action => `${action.entity}：${action.actionType}` === uniqueKey);
        if (action) {
            setSelectedEntity(action.entity);
            setSelectedActionType(action.actionType);
            setActionMode(action.mode);
            setUpperLimit(action.upperLimit);
            setLowerLimit(action.lowerLimit);
            setDiscreteValues(action.discreteValues);
            setEditingUniqueKey(uniqueKey);
            setModalOpen(true);
        }
    };

    const handleDeleteAction = (uniqueKey) => {
        if (window.confirm('是否删除该动作？')) {
            actionSpaceStore.deleteActionForModel(currentModelID, uniqueKey);

            if (sidebarStore.type === '同构多智能体') {
                const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
                const entityGroup = agentEntityMapping.find(group =>
                    Object.keys(group).some(entityName => uniqueKey.startsWith(entityName))
                );
                if (entityGroup) {
                    Object.entries(entityGroup).forEach(([entityName, agentName]) => {
                        if (!uniqueKey.startsWith(entityName)) {
                            const syncUniqueKey = `${entityName}：${uniqueKey.split('：')[1]}`;
                            actionSpaceStore.deleteActionForModel(agentName, syncUniqueKey);
                        }
                    });
                }
            }

            setActions(actionSpaceStore.getActionsForModel(currentModelID));
        }
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={actionLogo} alt="ActionSpace" className="sub-component-logo"/>
                <div className="sub-component-title">动作空间</div>
            </div>
            <div className="upload-button">
                <img
                    src={addLogo}
                    alt="Add Function"
                    className="upload-button-logo"
                    onClick={isAddButtonEnabled ? handleAddAction : null}
                    style={{
                        cursor: isAddButtonEnabled ? 'pointer' : 'not-allowed',
                        opacity: isAddButtonEnabled ? 1 : 0.5,
                    }}
                />
            </div>
            <div className="dropdown-container-wrapper">
                {actions.map(action => {
                    const uniqueKey = `${action.entity}：${action.actionType}`;
                    return (
                        <DropdownContainer
                            key={uniqueKey}
                            uniqueKey={uniqueKey}
                            action={action}
                            onEdit={handleEditAction}
                            onDelete={handleDeleteAction}
                            modelID={currentModelID}
                            selectedParams={selectedParams}
                        />
                    );
                })}
            </div>
            <ActionModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
                entities={entities}
                selectedEntity={selectedEntity}
                setSelectedEntity={setSelectedEntity}
                selectedActionType={selectedActionType}
                setSelectedActionType={setSelectedActionType}
                actionMode={actionMode}
                setActionMode={setActionMode}
                upperLimit={upperLimit}
                setUpperLimit={setUpperLimit}
                lowerLimit={lowerLimit}
                setLowerLimit={setLowerLimit}
                discreteValues={discreteValues}
                setDiscreteValues={setDiscreteValues}
                getActionUnit={getActionUnit}
                getActionRange={getActionRange}
                getActionDiscreteValues={getActionDiscreteValues}
                onModalCancel={() => setModalOpen(false)}
            />
        </div>
    );
};

const DropdownContainer = ({ uniqueKey, action, onEdit, onDelete, modelID, selectedParams }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [ruleOpen, setRuleOpen] = useState(false);
    const [selectedRuleNumber, setSelectedRuleNumber] = useState(null);
    const [ruleType, setRuleType] = useState('');
    const [condition, setCondition] = useState('');
    const [execution1, setExecution1] = useState([]);
    const [execution2, setExecution2] = useState([]);
    const [isConditionEditorOpen, setIsConditionEditorOpen] = useState(false);
    const [hoveredParam, setHoveredParam] = useState(null);
    const [isHovering, setIsHovering] = useState(false);

    const savedRules = actionSpaceStore.getAllRulesForAction(modelID, uniqueKey);
    const currentRule = selectedRuleNumber
        ? actionSpaceStore.getRuleForModel(modelID, uniqueKey, selectedRuleNumber)
        : null;

    useEffect(() => {
        if (currentRule) {
            setRuleType(currentRule.ruleType);
            setCondition(currentRule.condition);
            setExecution1(currentRule.execution1 || []);
            setExecution2(currentRule.execution2 || []);
        } else {
            setRuleType('');
            setCondition('');
            if (action.mode === '离散型') {
                setExecution1([...action.discreteValues]);
            } else if (action.mode === '连续型') {
                setExecution1([action.lowerLimit, action.upperLimit]);
            }
            setExecution2([]);
        }
    }, [currentRule, action]);

    const handleAddRule = () => {
        const nextRuleNumber = savedRules.length + 1;
        setSelectedRuleNumber(nextRuleNumber);
        setRuleType('');
        setCondition('');
        if (action.mode === '离散型') {
            setExecution1([...action.discreteValues]);
        } else if (action.mode === '连续型') {
            setExecution1([action.lowerLimit, action.upperLimit]);
        }
        setExecution2([]);
    };

    const handleRuleConfirm = () => {
        if (!selectedRuleNumber) return;

        if (action.mode === '连续型') {
            const [min, max] = [parseFloat(action.lowerLimit), parseFloat(action.upperLimit)];
            let hasError = false;
            let resetExecution1 = false;
            let resetExecution2 = false;

            if (execution1.length !== 0 && execution1.length !== 2) {
                hasError = true;
                resetExecution1 = true;
            } else if (execution1.length === 2) {
                const [lower, upper] = execution1.map(Number);
                if (isNaN(lower) || isNaN(upper) || lower >= upper || lower < min || upper > max) {
                    hasError = true;
                    resetExecution1 = true;
                }
            }

            if (ruleType === 'IF ELSE') {
                if (execution2.length !== 0 && execution2.length !== 2) {
                    hasError = true;
                    resetExecution2 = true;
                } else if (execution2.length === 2) {
                    const [lower, upper] = execution2.map(Number);
                    if (isNaN(lower) || isNaN(upper) || lower >= upper || lower < min || upper > max) {
                        hasError = true;
                        resetExecution2 = true;
                    }
                }
            }

            if (hasError) {
                let errorMessage = `请输入正确的取值下限和上限，必须在[${min}, ${max}]范围内且下限小于上限！`;
                alert(errorMessage);

                if (resetExecution1) {
                    setExecution1([min, max]);
                }
                if (resetExecution2) {
                    setExecution2([]);
                }
                return;
            }
        }
    console.log(condition);
        if (condition == ""){
            let errorMessage = '请输入条件';
            alert(errorMessage);
            return;
        }
        const rule = {
            ruleType,
            condition,
            execution1: ruleType === 'FOR' ? execution1 : [...execution1],
            execution2: ruleType === 'FOR' ? [] : [...execution2]
        };
        actionSpaceStore.setRuleForModel(modelID, uniqueKey, rule, selectedRuleNumber);

        if (sidebarStore.type === '同构多智能体') {
            const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
            const entityGroup = agentEntityMapping.find(group =>
                Object.keys(group).some(entityName => uniqueKey.startsWith(entityName))
            );
            if (entityGroup) {
                Object.entries(entityGroup).forEach(([entityName, agentName]) => {
                    if (!uniqueKey.startsWith(entityName)) {
                        const syncUniqueKey = `${entityName}：${uniqueKey.split('：')[1]}`;
                        actionSpaceStore.setRuleForModel(agentName, syncUniqueKey, rule, selectedRuleNumber);
                    }
                });
            }
        }

        setRuleOpen(false);
    };

    const handleRuleCancel = () => {
        if (window.confirm('是否删除该行为规则？')) {
            actionSpaceStore.setRuleForModel(modelID, uniqueKey, null, selectedRuleNumber);

            const remainingRules = savedRules
                .filter(rule => rule.ruleNumber !== selectedRuleNumber)
                .sort((a, b) => a.ruleNumber - b.ruleNumber);

            actionSpaceStore.setRuleForModel(modelID, uniqueKey, null);

            remainingRules.forEach((rule, index) => {
                const newRuleNumber = index + 1;
                actionSpaceStore.setRuleForModel(
                    modelID,
                    uniqueKey,
                    {
                        ...rule,
                        ruleNumber: newRuleNumber
                    },
                    newRuleNumber
                );
            });

            if (sidebarStore.type === '同构多智能体') {
                const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
                const entityGroup = agentEntityMapping.find(group =>
                    Object.keys(group).some(entityName => uniqueKey.startsWith(entityName))
                );
                if (entityGroup) {
                    Object.entries(entityGroup).forEach(([entityName, agentName]) => {
                        if (!uniqueKey.startsWith(entityName)) {
                            const syncUniqueKey = `${entityName}：${uniqueKey.split('：')[1]}`;
                            actionSpaceStore.setRuleForModel(agentName, syncUniqueKey, null);

                            remainingRules.forEach((rule, index) => {
                                const newRuleNumber = index + 1;
                                actionSpaceStore.setRuleForModel(
                                    agentName,
                                    syncUniqueKey,
                                    {
                                        ...rule,
                                        ruleNumber: newRuleNumber
                                    },
                                    newRuleNumber
                                );
                            });
                        }
                    });
                }
            }

            setSelectedRuleNumber(null);
            setRuleOpen(false);
        }
    };

    const toggleDiscreteValue = (value, isExecution1) => {
        const setExecution = isExecution1 ? setExecution1 : setExecution2;
        const execution = isExecution1 ? execution1 : execution2;

        if (execution.includes(value)) {
            setExecution(execution.filter(v => v !== value));
        } else {
            setExecution([...execution, value]);
        }
    };

    const handleContinuousValueChange = (index, value, isExecution1) => {
        const setExecution = isExecution1 ? setExecution1 : setExecution2;
        const execution = isExecution1 ? [...execution1] : [...execution2];

        execution[index] = value;
        setExecution(execution);
    };

    const handleParamHover = (param) => {
        setIsHovering(true);
        setHoveredParam(param);
    };

    const handleParamLeave = () => {
        setIsHovering(false);
        setHoveredParam(null);
    };

    const handleConditionFocus = () => {
        setIsConditionEditorOpen(true);
    };

    const handleSymbolClick = (symbol) => {
        setCondition(prev => prev + symbol);
    };

    return (
        <div className="dropdown-container">
            <div className="dropdown-header">
                <div className="dropdown-title">{uniqueKey}</div>
                <div className="button-group">
                    <Button type="link" className="dropdown-button" onClick={() => setActionOpen(!actionOpen)}>
                        {actionOpen ? '▲' : '▼'}
                    </Button>
                    <div className="blue-divider"></div>
                    <div className={`rule-button ${ruleOpen ? 'active' : ''}`} onClick={() => setRuleOpen(!ruleOpen)}>
                        行为规则
                    </div>
                </div>
            </div>
            {actionOpen && (
                <ActionContent action={action} onEdit={onEdit} onDelete={onDelete} />
            )}
            {ruleOpen && (
                <div className="rule-content-container">
                    <div className="rule-row">
                        <span>规则编号：</span>
                        <Select
                            style={{ width: 200, marginRight: 10 }}
                            value={selectedRuleNumber}
                            onChange={setSelectedRuleNumber}
                            placeholder="选择规则编号"
                        >
                            {savedRules.map(rule => (
                                <Option key={rule.ruleNumber} value={rule.ruleNumber}>
                                    规则{rule.ruleNumber}
                                </Option>
                            ))}
                        </Select>
                        <Button className="centered-button" onClick={handleAddRule} style={{backgroundColor: '#0a4a8a', color: 'white'}}>+</Button>
                    </div>

                    {selectedRuleNumber && (
                        <>
                            <div className="rule-row">
                                <span>规则类型：</span>
                                <Select
                                    style={{ width: 200 }}
                                    onChange={setRuleType}
                                    value={ruleType}
                                >
                                    <Option key="IF ELSE" value="IF ELSE">IF ELSE</Option>
                                    <Option key="FOR" value="FOR">FOR</Option>
                                </Select>
                            </div>

                            <div className="rule-row">
                                <span>条件：</span>
                                <Input
                                    placeholder="输入条件表达式"
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="common-input"
                                    onFocus={handleConditionFocus}
                                />
                            </div>

                            {isConditionEditorOpen && (
                                <div className="reward-modal-overlay">
                                    <div className="reward-modal">
                                        <div className="reward-modal-header">条件表达式编辑器</div>
                                        <div className="symbol-groups">
                                            <div className="symbol-group">
                                                {["+", "-", "×", "÷", "^", "√", "sin", "cos", "tan", "log", "ln", "∏", "∑", "∧", "∨", "¬", "⊕", "[", "]", "(", ")", "=", "≈", "∂", "e", "π", "∈", "±"].map((symbol, index) => (
                                                    <button key={index} onClick={() => handleSymbolClick(symbol)}>
                                                        {symbol}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="symbol-group">
                                                {selectedParams?.map((param, index) => (
                                                    <button
                                                        key={index}
                                                        onMouseEnter={() => handleParamHover(param)}
                                                        onMouseLeave={handleParamLeave}
                                                        onClick={() => handleSymbolClick(param[0])}
                                                    >
                                                        {param[0]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {isHovering && hoveredParam && (
                                            <div className="tooltip">
                                                <div className="tooltip-content">
                                                    <div className="tooltip-title">{hoveredParam[0]}</div>
                                                    <div className="tooltip-description">{hoveredParam[1]}</div>
                                                    <div className="tooltip-unit">{hoveredParam[2]}</div>
                                                </div>
                                            </div>
                                        )}
                                        <textarea
                                            className="equation-input"
                                            value={condition}
                                            onChange={(e) => setCondition(e.target.value)}
                                            placeholder="在此输入或编辑条件表达式"
                                        />
                                        <div className="modal-buttons">
                                            <Button onClick={() => setIsConditionEditorOpen(false)} className="entity-button">取消</Button>
                                            <Button type="primary" onClick={() => setIsConditionEditorOpen(false)} className="entity-button">确认</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ruleType && (
                                <>
                                    <div className="rule-row">
                                        <span>{ruleType === 'FOR' ? 'DO：' : 'IF：'}</span>
                                        {action.mode === '离散型' && (
                                            <div className="discrete-buttons">
                                                {action.discreteValues.map(value => (
                                                    <Button
                                                        style={{
                                                            marginRight: 10,
                                                            backgroundColor: execution1.includes(value) ? '#0a4a8a' : 'white',
                                                            color: execution1.includes(value) ? 'white' : 'black'
                                                        }}
                                                        key={value}
                                                        onClick={() => toggleDiscreteValue(value, true)}
                                                    >
                                                        {value}
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                        {action.mode === '连续型' && (
                                            <div className="continuous-inputs">
                                                <Input
                                                    value={execution1[0] || ''}
                                                    onChange={(e) => handleContinuousValueChange(0, e.target.value, true)}
                                                    placeholder="下限"
                                                    style={{ width: 100 }}
                                                />
                                                <span> 至 </span>
                                                <Input
                                                    value={execution1[1] || ''}
                                                    onChange={(e) => handleContinuousValueChange(1, e.target.value, true)}
                                                    placeholder="上限"
                                                    style={{ width: 100 }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {ruleType === 'IF ELSE' && (
                                        <div className="rule-row">
                                            <span>ELSE：</span>
                                            {action.mode === '离散型' && (
                                                <div className="discrete-buttons">
                                                    {action.discreteValues.map(value => (
                                                        <Button
                                                            style={{
                                                                marginRight: 10,
                                                                backgroundColor: execution2.includes(value) ? '#0a4a8a' : 'white',
                                                                color: execution2.includes(value) ? 'white' : 'black'
                                                            }}
                                                            key={value}
                                                            onClick={() => toggleDiscreteValue(value, false)}
                                                        >
                                                            {value}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                            {action.mode === '连续型' && (
                                                <div className="continuous-inputs">
                                                    <Input
                                                        value={execution2[0] || ''}
                                                        onChange={(e) => handleContinuousValueChange(0, e.target.value, false)}
                                                        placeholder="下限"
                                                        style={{ width: 100 }}
                                                    />
                                                    <span> 至 </span>
                                                    <Input
                                                        value={execution2[1] || ''}
                                                        onChange={(e) => handleContinuousValueChange(1, e.target.value, false)}
                                                        placeholder="上限"
                                                        style={{ width: 100 }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="rule-row">
                                        <span>{action.mode === '离散型' ? '可选取值：' : '取值范围：'}</span>
                                        <span>
                                            {action.mode === '离散型'
                                                ? `{${action.discreteValues.join(', ')}}`
                                                : `[${action.lowerLimit}, ${action.upperLimit}]`}
                                        </span>
                                    </div>

                                    <div className="rule-buttons">
                                        <Button onClick={handleRuleConfirm} className="entity-button">保存</Button>
                                        <Button onClick={handleRuleCancel} className="entity-button">删除</Button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ActionContent = ({ action, onEdit, onDelete }) => {
    return (
        <div className="action-container">
            <div className="action-text">实体：{action.entity}</div>
            <div className="action-text">动作种类：{action.actionType}</div>
            <div className="action-text">动作类型：{action.mode}</div>
            <div className="action-text">动作空间：</div>
            {action.mode === '连续型' && (
                <>
                    <div className="action-text">取值上限：{action.upperLimit} ({action.unit})</div>
                    <div className="action-text">取值下限：{action.lowerLimit} ({action.unit})</div>
                    <div className="action-text">最大取值范围：[{action.range.join(', ')}]</div>
                </>
            )}
            {action.mode === '离散型' && (
                <>
                    {action.discreteValues.map((value, index) => (
                        <div className="action-text" key={index}>取值{index + 1}：{value}</div>
                    ))}
                    <div className="action-text">可选取值：{`{${action.discreteOptions.join(', ')}}`}</div>
                </>
            )}
            <div className="action-buttons">
                <Button onClick={() => onEdit(`${action.entity}：${action.actionType}`)} className="entity-button">编辑</Button>
                <Button onClick={() => onDelete(`${action.entity}：${action.actionType}`)} className="entity-button">删除</Button>
            </div>
        </div>
    );
};

const ActionModal = ({
                         open,
                         onCancel,
                         onConfirm,
                         entities,
                         selectedEntity,
                         setSelectedEntity,
                         selectedActionType,
                         setSelectedActionType,
                         actionMode,
                         setActionMode,
                         upperLimit,
                         setUpperLimit,
                         lowerLimit,
                         setLowerLimit,
                         discreteValues,
                         setDiscreteValues,
                         getActionUnit,
                         getActionRange,
                         getActionDiscreteValues,
                         onModalCancel
                     }) => {
    useEffect(() => {
        const range = getActionRange();
        const discreteOptions = getActionDiscreteValues();

        if (actionMode === '连续型' &&
            (range.length !== 2 || range[0] >= range[1])) {
            setActionMode('');
        }
        if (actionMode === '离散型' && discreteOptions.length === 0) {
            setActionMode('');
        }
    }, [selectedActionType]);

    const handleAddDiscreteValue = () => {
        const availableOptions = getActionDiscreteValues().filter(value => !discreteValues.includes(value));
        if (availableOptions.length === 0) {
            alert('没有可选的取值了！');
            return;
        }
        setDiscreteValues([...discreteValues, availableOptions[0]]);
    };

    const handleRemoveDiscreteValue = (index) => {
        const newValues = discreteValues.filter((_, i) => i !== index);
        setDiscreteValues(newValues);
    };

    const handleDiscreteValueChange = (index, value) => {
        const newValues = [...discreteValues];
        newValues[index] = value;
        setDiscreteValues(newValues);
    };

    const showButtons = actionMode !== '';

    const handleUpperLimitChange = (e) => {
        const value = e.target.value;
        setUpperLimit(value);
    };

    const handleLowerLimitChange = (e) => {
        const value = e.target.value;
        setLowerLimit(value);
    };

    const handleConfirm = () => {
        if (actionMode === '连续型') {
            const range = getActionRange();
            const errors = [];

            if (!/^\d*\.?\d+$/.test(upperLimit)) {
                errors.push('取值上限必须是一个合法的浮点数！');
                setUpperLimit('');
            }

            if (!/^\d*\.?\d+$/.test(lowerLimit)) {
                errors.push('取值下限必须是一个合法的浮点数！');
                setLowerLimit('');
            }

            if (/^\d*\.?\d+$/.test(upperLimit) && /^\d*\.?\d+$/.test(lowerLimit)) {
                const upper = parseFloat(upperLimit);
                const lower = parseFloat(lowerLimit);

                if (range.length === 2 && (upper < range[0] || upper > range[1])) {
                    errors.push(`取值上限必须在${range[0]}到${range[1]}之间！`);
                    setUpperLimit('');
                }

                if (range.length === 2 && (lower < range[0] || lower > range[1])) {
                    errors.push(`取值下限必须在${range[0]}到${range[1]}之间！`);
                    setLowerLimit('');
                }

                if (lower >= upper) {
                    errors.push('取值下限必须小于取值上限！');
                    setUpperLimit('');
                    setLowerLimit('');
                }
            }

            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }
        }
        onConfirm();
    };

    const getAvailableActionTypes = () => {
        if (!selectedEntity) return [];
        const entity = entities.find(e => e.name === selectedEntity);
        return entity?.actionTypes || [];
    };

    return (
        <Modal
            title="动作编辑"
            open={open}
            onCancel={onCancel}
            footer={showButtons ? [
                <Button key="cancel" onClick={onModalCancel}>取消</Button>,
                <Button key="confirm" type="primary" onClick={handleConfirm}>确认</Button>
            ] : null}
        >
            <div className="modal-content">
                <div className="modal-row">
                    <span className="modal-label">实体：</span>
                    <Select
                        value={selectedEntity}
                        onChange={setSelectedEntity}
                        style={{ width: '300px' }}
                    >
                        {entities.map(entity => (
                            <Option key={entity.name} value={entity.name}>{entity.name}</Option>
                        ))}
                    </Select>
                </div>
                <div className="modal-row">
                    <span className="modal-label">动作种类：</span>
                    <Select
                        value={selectedActionType}
                        onChange={setSelectedActionType}
                        style={{ width: '300px' }}
                        disabled={!selectedEntity}
                    >
                        {getAvailableActionTypes().map(type => (
                            <Option key={type[0]} value={type[0]}>{type[0]}</Option>
                        ))}
                    </Select>
                </div>
                <div className="modal-row">
                    <span className="modal-label">动作类型：</span>
                    <Select
                        value={actionMode}
                        onChange={setActionMode}
                        style={{ width: '300px' }}
                        disabled={!selectedActionType}
                    >
                        {getActionRange().length === 2 && getActionRange()[0] < getActionRange()[1] && (
                            <Option value="连续型">连续型</Option>
                        )}
                        {getActionDiscreteValues().length > 0 && (
                            <Option value="离散型">离散型</Option>
                        )}
                    </Select>
                </div>
                {actionMode && (
                    <div className="modal-row">
                        <span className="modal-label">动作空间：</span>
                    </div>
                )}
                {actionMode === '连续型' && (
                    <>
                        <div className="modal-row">
                            <span className="modal-label">取值上限：</span>
                            <Input
                                value={upperLimit}
                                onChange={handleUpperLimitChange}
                                addonAfter={<span style={{ color: 'white' }}>{getActionUnit()}</span>}
                                style={{ width: '250px' }}
                            />
                        </div>
                        <div className="modal-row">
                            <span className="modal-label">取值下限：</span>
                            <Input
                                value={lowerLimit}
                                onChange={handleLowerLimitChange}
                                addonAfter={<span style={{ color: 'white' }}>{getActionUnit()}</span>}
                                style={{ width: '250px' }}
                            />
                        </div>
                        <div className="modal-row">
                            <span className="modal-label">最大取值范围：</span>
                            <span>[{getActionRange().join(', ')}]</span>
                        </div>
                    </>
                )}
                {actionMode === '离散型' && (
                    <>
                        {discreteValues.map((value, index) => (
                            <div className="modal-row" key={index}>
                                <span className="modal-label">取值{index + 1}：</span>
                                <Select
                                    value={value}
                                    onChange={(value) => handleDiscreteValueChange(index, value)}
                                    style={{ width: '200px' }}
                                >
                                    {getActionDiscreteValues()
                                        .filter(option => !discreteValues.includes(option) || option === value)
                                        .map(option => (
                                            <Option key={option} value={option}>{option}</Option>
                                        ))}
                                </Select>
                                <Button onClick={() => handleRemoveDiscreteValue(index)} style={{backgroundColor: '#0a4a8a', color: 'white'}}>-</Button>
                            </div>
                        ))}
                        <div className="modal-row">
                            <Button onClick={handleAddDiscreteValue} style={{backgroundColor: '#0a4a8a', color: 'white'}}>+</Button>
                        </div>
                        <div className="modal-row">
                            <span className="modal-label">可选取值：</span>
                            <span>[{getActionDiscreteValues().join(', ')}]</span>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ActionSpace;