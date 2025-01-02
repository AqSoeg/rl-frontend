import { useState, useEffect } from 'react';
import { Button, Select, Input, Modal } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import addLogo from "../../assets/add.svg";
import actionSpaceStore from './ActionSpaceStore';
import entityAssignmentStore from './EntityAssignmentStore';

const { Option } = Select;

const ActionSpace = ({ entities, actionTypes }) => {
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
        if (!selectedActionType) return '';
        const action = actionTypes.find(type => type[0] === selectedActionType);
        return action ? action[1] : '';
    };

    const getActionRange = () => {
        if (!selectedActionType) return [];
        const action = actionTypes.find(type => type[0] === selectedActionType);
        return action ? action[2] : [];
    };

    const getActionDiscreteValues = () => {
        if (!selectedActionType) return [];
        const action = actionTypes.find(type => type[0] === selectedActionType);
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
            actionSpaceStore.updateActionForModel(currentModelID, editingUniqueKey, action);
        } else {
            const existingAction = actions.find(a => `${a.entity}：${a.actionType}` === uniqueKey);
            if (existingAction) {
                actionSpaceStore.updateActionForModel(currentModelID, uniqueKey, action);
            } else {
                actionSpaceStore.addActionForModel(currentModelID, action);
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
                        marginRight: '20px'
                    }}
                />
                <img src={uploadLogo} alt="Upload" className="upload-button-logo"/>
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
                        />
                    );
                })}
            </div>
            <ActionModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={handleModalConfirm}
                entities={entities}
                actionTypes={actionTypes}
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

const DropdownContainer = ({ uniqueKey, action, onEdit, onDelete, modelID }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [ruleOpen, setRuleOpen] = useState(false);
    const [ruleType, setRuleType] = useState('');
    const [condition1, setCondition1] = useState('');
    const [condition2, setCondition2] = useState('');
    const [execution1, setExecution1] = useState('');
    const [execution2, setExecution2] = useState('');

    const savedRule = actionSpaceStore.getRuleForModel(modelID, uniqueKey);

    useEffect(() => {
        if (savedRule) {
            setRuleType(savedRule.ruleType);
            setCondition1(savedRule.condition1);
            setCondition2(savedRule.condition2);
            setExecution1(savedRule.execution1);
            setExecution2(savedRule.execution2);
        } else {
            setRuleType('');
            setCondition1('');
            setCondition2('');
            setExecution1('');
            setExecution2('');
        }
    }, [ruleOpen, savedRule]);

    const handleRuleConfirm = () => {
        actionSpaceStore.setRuleForModel(modelID, uniqueKey, { ruleType, condition1, condition2, execution1, execution2 });
        setRuleOpen(false);
    };

    const handleRuleCancel = () => {
        if (window.confirm('是否取消该行为规则？')) {
            setRuleType('');
            setCondition1('');
            setCondition2('');
            setExecution1('');
            setExecution2('');
            actionSpaceStore.setRuleForModel(modelID, uniqueKey, null);
            setRuleOpen(false);
        }
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
                <RuleContent
                    ruleType={ruleType}
                    setRuleType={setRuleType}
                    condition1={condition1}
                    setCondition1={setCondition1}
                    condition2={condition2}
                    setCondition2={setCondition2}
                    execution1={execution1}
                    setExecution1={setExecution1}
                    execution2={execution2}
                    setExecution2={setExecution2}
                    onConfirm={handleRuleConfirm}
                    onCancel={handleRuleCancel}
                />
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
                    <div className="action-text">可选取值：[{action.discreteOptions.join(', ')}]</div>
                </>
            )}
            <div className="action-buttons">
                <Button type="primary" onClick={() => onEdit(`${action.entity}：${action.actionType}`)}>编辑</Button>
                <Button onClick={() => onDelete(`${action.entity}：${action.actionType}`)}>删除</Button>
            </div>
        </div>
    );
};

const RuleContent = ({
                         ruleType,
                         setRuleType,
                         condition1,
                         setCondition1,
                         condition2,
                         setCondition2,
                         execution1,
                         setExecution1,
                         execution2,
                         setExecution2,
                         onConfirm,
                         onCancel
                     }) => {
    return (
        <div className="rule-container">
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
                <span>条件1：</span>
                <Input
                    placeholder="单行输入"
                    value={condition1}
                    onChange={(e) => setCondition1(e.target.value)}
                    className="common-input"
                />
            </div>
            <div className="rule-row">
                <span>条件2：</span>
                <Input
                    placeholder="单行输入"
                    value={condition2}
                    onChange={(e) => setCondition2(e.target.value)}
                    className="common-input"
                />
            </div>
            <div className="rule-row">
                <span>执行内容1：</span>
                <Input
                    placeholder="单行输入"
                    value={execution1}
                    onChange={(e) => setExecution1(e.target.value)}
                    className="common-input"
                />
            </div>
            <div className="rule-row">
                <span>执行内容2：</span>
                <Input
                    placeholder="单行输入"
                    value={execution2}
                    onChange={(e) => setExecution2(e.target.value)}
                    className="common-input"
                />
            </div>
            <div className="rule-buttons">
                <Button type="primary" onClick={onConfirm}>确定</Button>
                <Button onClick={onCancel}>取消</Button>
            </div>
        </div>
    );
};

const ActionModal = ({
                         open,
                         onCancel,
                         onConfirm,
                         entities,
                         actionTypes,
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

            // 检查取值上限是否为合法浮点数
            if (!/^\d*\.?\d+$/.test(upperLimit)) {
                errors.push('取值上限必须是一个合法的浮点数！');
                setUpperLimit('');
            }

            // 检查取值下限是否为合法浮点数
            if (!/^\d*\.?\d+$/.test(lowerLimit)) {
                errors.push('取值下限必须是一个合法的浮点数！');
                setLowerLimit('');
            }

            // 如果取值上限和下限是合法浮点数，继续检查范围
            if (/^\d*\.?\d+$/.test(upperLimit) && /^\d*\.?\d+$/.test(lowerLimit)) {
                const upper = parseFloat(upperLimit);
                const lower = parseFloat(lowerLimit);

                // 检查取值上限是否在允许的范围内
                if (range.length === 2 && (upper < range[0] || upper > range[1])) {
                    errors.push(`取值上限必须在${range[0]}到${range[1]}之间！`);
                    setUpperLimit('');
                }

                // 检查取值下限是否在允许的范围内
                if (range.length === 2 && (lower < range[0] || lower > range[1])) {
                    errors.push(`取值下限必须在${range[0]}到${range[1]}之间！`);
                    setLowerLimit('');
                }

                // 检查取值下限是否小于取值上限
                if (lower >= upper) {
                    errors.push('取值下限必须小于取值上限！');
                    setUpperLimit('');
                    setLowerLimit('');
                }
            }

            // 如果有错误，弹出提示并返回
            if (errors.length > 0) {
                alert(errors.join('\n')); // 将所有错误信息合并为一条提示
                return;
            }
        }
        onConfirm();
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
                        {actionTypes.map(type => (
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
                        <Option value="连续型">连续型</Option>
                        <Option value="离散型">离散型</Option>
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
                                addonAfter={getActionUnit()}
                                style={{ width: '250px' }}
                            />
                        </div>
                        <div className="modal-row">
                            <span className="modal-label">取值下限：</span>
                            <Input
                                value={lowerLimit}
                                onChange={handleLowerLimitChange}
                                addonAfter={getActionUnit()}
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
                                <Button onClick={() => handleRemoveDiscreteValue(index)}>-</Button>
                            </div>
                        ))}
                        <div className="modal-row">
                            <Button onClick={handleAddDiscreteValue}>+</Button>
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