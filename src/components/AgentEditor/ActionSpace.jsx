import { useState, useEffect } from 'react';
import { Button, Select, Input, Modal, Alert } from 'antd';
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
        // 重置弹窗状态
        setSelectedEntity('');
        setSelectedActionType('');
        setActionMode('');
        setUpperLimit('');
        setLowerLimit('');
        setDiscreteValues(['']);
        setEditingUniqueKey(null); // 设置为新增模式
        setModalOpen(true); // 打开弹窗
    };

    const handleModalConfirm = () => {
        const uniqueKey = `${selectedEntity}-${selectedActionType}`;
        const action = {
            entity: selectedEntity,
            actionType: selectedActionType,
            mode: actionMode,
            upperLimit,
            lowerLimit,
            discreteValues,
        };

        // 检查是否已经存在相同的 uniqueKey
        const existingIndex = dropdowns.findIndex(key => key === uniqueKey);

        if (existingIndex !== -1) {
            // 如果存在相同的 uniqueKey，更新该下拉框的内容
            actionSpaceStore.setAction(uniqueKey, action);
            setDropdowns([...dropdowns]); // 保持 dropdowns 不变，触发重新渲染
        } else {
            // 如果不存在相同的 uniqueKey，添加新的下拉框
            actionSpaceStore.setAction(uniqueKey, action);
            setDropdowns([...dropdowns, uniqueKey]);
        }

        setModalOpen(false);
    };

    const handleModalCancel = () => {
        if (window.confirm('是否取消编辑？')) {
            setModalOpen(false);
        }
    };

    const handleEditAction = (uniqueKey) => {
        const action = actionSpaceStore.getAction(uniqueKey);
        // 填充弹窗内容
        setSelectedEntity(action.entity);
        setSelectedActionType(action.actionType);
        setActionMode(action.mode);
        setUpperLimit(action.upperLimit);
        setLowerLimit(action.lowerLimit);
        setDiscreteValues(action.discreteValues);
        setEditingUniqueKey(uniqueKey); // 设置为编辑模式
        setModalOpen(true); // 打开弹窗
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
                onCancel={handleModalCancel}
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

    const handleRuleConfirm = () => {
        actionSpaceStore.setRule(uniqueKey, { ruleType, condition1, condition2, execution1, execution2 });
        setRuleOpen(false);
    };

    const handleRuleCancel = () => {
        if (window.confirm('是否取消编辑？')) {
            setRuleType('');
            setCondition1('');
            setCondition2('');
            setExecution1('');
            setExecution2('');
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
            <div>实体: {action.entity}</div>
            <div>动作种类: {action.actionType}</div>
            <div>动作类型: {action.mode}</div>
            {action.mode === '连续型' && (
                <>
                    <div>取值上限: {action.upperLimit}</div>
                    <div>取值下限: {action.lowerLimit}</div>
                </>
            )}
            {action.mode === '离散型' && (
                <div>
                    {action.discreteValues.map((value, index) => (
                        <div key={index}>取值{index + 1}: {value}</div>
                    ))}
                </div>
            )}
            <Button onClick={() => onEdit(uniqueKey)}>编辑</Button>
            <Button onClick={() => onDelete(uniqueKey)}>删除</Button>
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
                    <Option key="WHILE" value="WHILE">WHILE</Option>
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
                         setDiscreteValues
                     }) => {
    const handleAddDiscreteValue = () => {
        setDiscreteValues([...discreteValues, '']);
    };

    const handleRemoveDiscreteValue = (index) => {
        const newValues = discreteValues.filter((_, i) => i !== index);
        setDiscreteValues(newValues);
    };

    // 是否显示确认和取消按钮
    const showButtons = actionMode !== ''; // 当动作类型被选择后显示按钮

    return (
        <Modal
            title="动作编辑"
            open={open}
            onCancel={onCancel}
            footer={showButtons ? [ // 动态控制按钮的显示
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="confirm" type="primary" onClick={onConfirm}>确认</Button>
            ] : null} // 如果没有选择动作类型，则不显示按钮
        >
            <div>
                <div>实体：</div>
                <Select
                    value={selectedEntity}
                    onChange={setSelectedEntity}
                    style={{ width: '100%' }}
                >
                    {entities.map(entity => (
                        <Option key={entity.name} value={entity.name}>{entity.name}</Option>
                    ))}
                </Select>
            </div>
            <div>
                <div>动作种类：</div>
                <Select
                    value={selectedActionType}
                    onChange={setSelectedActionType}
                    style={{ width: '100%' }}
                    disabled={!selectedEntity}
                >
                    {actionTypes.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                    ))}
                </Select>
            </div>
            <div>
                <div>动作类型：</div>
                <Select
                    value={actionMode}
                    onChange={setActionMode}
                    style={{ width: '100%' }}
                    disabled={!selectedActionType}
                >
                    <Option value="连续型">连续型</Option>
                    <Option value="离散型">离散型</Option>
                </Select>
            </div>
            {actionMode === '连续型' && (
                <>
                    <div>取值上限：</div>
                    <Input
                        value={upperLimit}
                        onChange={(e) => setUpperLimit(e.target.value)}
                    />
                    <div>取值下限：</div>
                    <Input
                        value={lowerLimit}
                        onChange={(e) => setLowerLimit(e.target.value)}
                    />
                </>
            )}
            {actionMode === '离散型' && (
                <>
                    {discreteValues.map((value, index) => (
                        <div key={index}>
                            <div>取值{index + 1}：</div>
                            <Input
                                value={value}
                                onChange={(e) => {
                                    const newValues = [...discreteValues];
                                    newValues[index] = e.target.value;
                                    setDiscreteValues(newValues);
                                }}
                            />
                            <Button onClick={() => handleRemoveDiscreteValue(index)}>-</Button>
                        </div>
                    ))}
                    <Button onClick={handleAddDiscreteValue}>+</Button>
                </>
            )}
        </Modal>
    );
};

export default ActionSpace;