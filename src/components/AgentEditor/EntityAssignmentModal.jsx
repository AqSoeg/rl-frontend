import { useState, useEffect } from 'react';
import { Modal, Alert, List, Checkbox } from 'antd';

const EntityAssignmentModal = ({ visible, onCancel, onConfirm, entityCount, agentCount, agentType, entities }) => {
    const [selectedEntities, setSelectedEntities] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [currentAgent, setCurrentAgent] = useState(''); // 当前选中的智能体模型

    useEffect(() => {
        // 初始化选中实体的状态
        if (visible) {
            const initialSelectedEntities = {};
            for (let i = 1; i <= agentCount; i++) {
                initialSelectedEntities[`智能体${i}`] = [];
            }
            setSelectedEntities(initialSelectedEntities);
            setCurrentAgent(`智能体1`); // 默认选中第一个智能体

            // 如果是单智能体，自动分配所有实体
            if (agentType === '单智能体') {
                setSelectedEntities({
                    [`智能体1`]: entities.map(entity => entity.name),
                });
            }
        }
    }, [visible, agentCount, agentType, entities]);

    const handleEntitySelect = (agent, entity) => {
        const currentSelected = selectedEntities[agent] || []; // 确保 currentSelected 不为 undefined
        if (currentSelected.includes(entity)) {
            // 如果已经选中，则取消选中
            setSelectedEntities({
                ...selectedEntities,
                [agent]: currentSelected.filter(e => e !== entity),
            });
        } else {
            // 如果没有选中，则添加选中
            setSelectedEntities({
                ...selectedEntities,
                [agent]: [...currentSelected, entity],
            });
        }
    };

    const validateSelection = () => {
        const allSelectedEntities = Object.values(selectedEntities).flat();

        // 检查是否有实体未被选中
        if (allSelectedEntities.length !== entityCount) {
            setErrorMessage('所有实体必须被分配！');
            return false;
        }

        // 检查是否有重复分配的实体
        const uniqueEntities = new Set(allSelectedEntities);
        if (uniqueEntities.size !== entityCount) {
            setErrorMessage('实体不能被重复分配！');
            return false;
        }

        // 根据智能体类型进行额外验证
        if (agentType === '同构多智能体') {
            const requiredCount = entityCount / agentCount;
            for (const agent in selectedEntities) {
                if (selectedEntities[agent].length !== requiredCount) {
                    setErrorMessage(`每个智能体必须选择 ${requiredCount} 个实体！`);
                    return false;
                }
            }
        } else if (agentType === '异构多智能体') {
            for (const agent in selectedEntities) {
                if (selectedEntities[agent].length === 0) {
                    setErrorMessage('每个智能体至少需要选择一个实体！');
                    return false;
                }
            }
        }

        setErrorMessage('');
        return true;
    };

    const handleConfirm = () => {
        if (validateSelection()) {
            onConfirm(selectedEntities);
        }
    };

    // 提取实体的名称
    const entityNames = entities.map(entity => entity.name);

    // 检查实体是否已经被分配给其他智能体
    const isEntityAssigned = (entity) => {
        return Object.values(selectedEntities).some(entities => entities.includes(entity));
    };

    return (
        <Modal
            title="分配实体"
            visible={visible}
            onCancel={onCancel}
            onOk={handleConfirm}
            okText="确认"
            cancelText="取消"
            width={800}
            className="entity-assignment-modal" // 添加 BEM 类名
        >
            {errorMessage && <Alert message={errorMessage} type="error" showIcon className="entity-assignment-modal__alert" />}
            <div className="entity-assignment-modal__content">
                <div className="entity-assignment-modal__column">
                    <h3 className="entity-assignment-modal__title">智能体模型</h3>
                    <List
                        bordered
                        dataSource={Object.keys(selectedEntities)}
                        renderItem={agent => (
                            <List.Item
                                onClick={() => setCurrentAgent(agent)} // 点击切换当前智能体
                                className={`entity-assignment-modal__agent-item ${currentAgent === agent ? 'entity-assignment-modal__agent-item--active' : ''}`}
                            >
                                <div className="entity-assignment-modal__agent-content">
                                    <strong>{agent}</strong>
                                    <div>
                                        {(selectedEntities[agent] || []).map(entity => (
                                            <span key={entity} className="entity-assignment-modal__entity-name">
                                                {entity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>
                <div className="entity-assignment-modal__column">
                    <h3 className="entity-assignment-modal__title">所有实体</h3>
                    <List
                        bordered
                        dataSource={entityNames} // 使用提取的实体名称
                        renderItem={entity => {
                            const isAssigned = isEntityAssigned(entity); // 检查实体是否已经被分配
                            const isCurrentAgentAssigned = selectedEntities[currentAgent]?.includes(entity); // 检查当前智能体是否已经分配该实体

                            return (
                                <List.Item className="entity-assignment-modal__entity-item">
                                    <Checkbox
                                        checked={isCurrentAgentAssigned} // 当前智能体是否选中该实体
                                        onChange={() => handleEntitySelect(currentAgent, entity)}
                                        disabled={agentType === '单智能体' || (isAssigned && !isCurrentAgentAssigned)} // 如果是单智能体或实体已被分配给其他智能体，禁用选择
                                        className="entity-assignment-modal__checkbox"
                                    >
                                        {entity}
                                    </Checkbox>
                                    {isAssigned && !isCurrentAgentAssigned && (
                                        <span className="entity-assignment-modal__assigned-label">
                                            已分配
                                        </span>
                                    )}
                                </List.Item>
                            );
                        }}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default EntityAssignmentModal;