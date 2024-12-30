import { useState, useEffect } from 'react';
import { Button, Select, Input, Modal } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import addLogo from "../../assets/add.svg";
import actionSpaceStore from './ActionSpaceStore';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';

const { Option } = Select;

const ActionSpace = ({ entities, actionTypes }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEntity, setSelectedEntity] = useState('');
    const [selectedActionType, setSelectedActionType] = useState('');
    const [actionMode, setActionMode] = useState('');
    const [upperLimit, setUpperLimit] = useState('');
    const [lowerLimit, setLowerLimit] = useState('');
    const [discreteValues, setDiscreteValues] = useState(['']);
    const [dropdowns, setDropdowns] = useState([]);
    const [isAddButtonEnabled, setIsAddButtonEnabled] = useState(false);
    const [editingUniqueKey, setEditingUniqueKey] = useState(null);

    const getActionUnit = () => {
        if (!selectedActionType) return '';
        const action = actionTypes.find(type => type[0] === selectedActionType);
        return action ? action[1] : '';
    };

    useEffect(() => {
        const unsubscribe = entityAssignmentStore.subscribe(() => {
            setIsAddButtonEnabled(!!entityAssignmentStore.selectedAgent);
        });

        setIsAddButtonEnabled(!!entityAssignmentStore.selectedAgent);

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribeSidebar = sidebarStore.subscribe(() => {
            actionSpaceStore.clearActions();
            setDropdowns([]);
        });

        const unsubscribeEntity = entityAssignmentStore.subscribe(() => {
            actionSpaceStore.clearActions();
            setDropdowns([]);
        });

        return () => {
            unsubscribeSidebar();
            unsubscribeEntity();
        };
    }, []);

    const handleAddAction = () => {
        setSelectedEntity('');
        setSelectedActionType('');
        setActionMode('');
        setUpperLimit('');
        setLowerLimit('');
        setDiscreteValues(['']);
        setEditingUniqueKey(null);
        setModalOpen(true);
    };

    const handleModalConfirm = () => {
        if (actionMode === '离散型' && discreteValues.every(value => value.trim() === '')) {
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
        };

        const existingIndex = dropdowns.findIndex(key => key === uniqueKey);

        if (existingIndex !== -1) {
            actionSpaceStore.setAction(uniqueKey, action);
            setDropdowns([...dropdowns]);
        } else {
            actionSpaceStore.setAction(uniqueKey, action);
            setDropdowns([...dropdowns, uniqueKey]);
        }

        setModalOpen(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleModalCancel = () => {
        if (window.confirm('是否取消编辑？')) {
            setModalOpen(false);
        }
    };

    const handleEditAction = (uniqueKey) => {
        const action = actionSpaceStore.getAction(uniqueKey);
        setSelectedEntity(action.entity);
        setSelectedActionType(action.actionType);
        setActionMode(action.mode);
        setUpperLimit(action.upperLimit);
        setLowerLimit(action.lowerLimit);
        setDiscreteValues(action.discreteValues);
        setEditingUniqueKey(uniqueKey);
        setModalOpen(true);
    };

    const handleDeleteAction = (uniqueKey) => {
        if (window.confirm('是否删除该动作？')) {
            actionSpaceStore.deleteAction(uniqueKey);
            setDropdowns(dropdowns.filter(key => key !== uniqueKey));
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
                {dropdowns.map(uniqueKey => (
                    <DropdownContainer
                        key={uniqueKey}
                        uniqueKey={uniqueKey}
                        onEdit={handleEditAction}
                        onDelete={handleDeleteAction}
                    />
                ))}
            </div>
            <ActionModal
                open={modalOpen}
                onCancel={handleCloseModal}
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
                onModalCancel={handleModalCancel}
            />
        </div>
    );
};

const DropdownContainer = ({ uniqueKey, onEdit, onDelete }) => {
    const [actionOpen, setActionOpen] = useState(false);
    const [ruleOpen, setRuleOpen] = useState(false);
    const [ruleType, setRuleType] = useState('');
    const [condition1, setCondition1] = useState('');
    const [condition2, setCondition2] = useState('');
    const [execution1, setExecution1] = useState('');
    const [execution2, setExecution2] = useState('');

    // 从 store 中获取当前保存的规则
    const savedRule = actionSpaceStore.getRule(uniqueKey);

    // 初始化规则内容
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
        // 保存规则到 store
        actionSpaceStore.setRule(uniqueKey, { ruleType, condition1, condition2, execution1, execution2 });
        setRuleOpen(false);
    };

    const handleRuleCancel = () => {
        if (window.confirm('是否取消编辑？')) {
            // 清空输入内容
            setRuleType('');
            setCondition1('');
            setCondition2('');
            setExecution1('');
            setExecution2('');
            // 清空 store 中的规则状态
            actionSpaceStore.setRule(uniqueKey, null);
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
                <ActionContent
                    uniqueKey={uniqueKey}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
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

const ActionContent = ({ uniqueKey, onEdit, onDelete }) => {
    const action = actionSpaceStore.getAction(uniqueKey);

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
                </>
            )}
            {action.mode === '离散型' && (
                <div>
                    {action.discreteValues.map((value, index) => (
                        <div className="action-text" key={index}>取值{index + 1}：{value}</div>
                    ))}
                </div>
            )}
            <div className="action-buttons">
                <Button type="primary" onClick={() => onEdit(uniqueKey)}>编辑</Button>
                <Button onClick={() => onDelete(uniqueKey)}>删除</Button>
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
                         onModalCancel
                     }) => {
    const handleAddDiscreteValue = () => {
        setDiscreteValues([...discreteValues, '']);
    };

    const handleRemoveDiscreteValue = (index) => {
        const newValues = discreteValues.filter((_, i) => i !== index);
        setDiscreteValues(newValues);
    };

    const showButtons = actionMode !== '';

    return (
        <Modal
            title="动作编辑"
            open={open}
            onCancel={onCancel}
            footer={showButtons ? [
                <Button key="cancel" onClick={onModalCancel}>取消</Button>,
                <Button key="confirm" type="primary" onClick={onConfirm}>确认</Button>
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
                                onChange={(e) => setUpperLimit(e.target.value)}
                                addonAfter={getActionUnit()}
                                style={{ width: '250px' }}
                            />
                        </div>
                        <div className="modal-row">
                            <span className="modal-label">取值下限：</span>
                            <Input
                                value={lowerLimit}
                                onChange={(e) => setLowerLimit(e.target.value)}
                                addonAfter={getActionUnit()}
                                style={{ width: '250px' }}
                            />
                        </div>
                    </>
                )}
                {actionMode === '离散型' && (
                    <>
                        {discreteValues.map((value, index) => (
                            <div className="modal-row" key={index}>
                                <span className="modal-label">取值{index + 1}：</span>
                                <Input
                                    value={value}
                                    onChange={(e) => {
                                        const newValues = [...discreteValues];
                                        newValues[index] = e.target.value;
                                        setDiscreteValues(newValues);
                                    }}
                                    style={{ width: '250px' }}
                                />
                                <Button onClick={() => handleRemoveDiscreteValue(index)}>-</Button>
                            </div>
                        ))}
                        <div className="modal-row">
                            <Button onClick={handleAddDiscreteValue}>+</Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ActionSpace;