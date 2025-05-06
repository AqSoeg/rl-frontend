import { useState, useEffect } from 'react';
import { Modal, Alert, List, Checkbox } from 'antd';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';
import stateVectorStore from './StateVectorStore';
import actionSpaceStore from './ActionSpaceStore';

const EntityAssignmentModal = ({ open, onCancel, onConfirm }) => {
    const [selectedEntities, setSelectedEntities] = useState({});
    const [errorMessage, setErrorMessage] = useState('');
    const [currentAgent, setCurrentAgent] = useState('');

    useEffect(() => {
        if (open) {
            const initialSelectedEntities = {};
            for (let i = 1; i <= sidebarStore.agentCount; i++) {
                initialSelectedEntities[`智能体${i}`] = [];
            }
            setSelectedEntities(initialSelectedEntities);
            setCurrentAgent(`智能体1`);

            if (sidebarStore.type === '单智能体') {
                setSelectedEntities({
                    [`智能体1`]: entityAssignmentStore.entityNames,
                });
            }
        }
    }, [open, sidebarStore.agentCount, sidebarStore.type, entityAssignmentStore.entityNames]);

    const handleEntitySelect = (agent, entity) => {
        const currentSelected = selectedEntities[agent] || [];
        if (currentSelected.includes(entity)) {
            setSelectedEntities({
                ...selectedEntities,
                [agent]: currentSelected.filter(e => e !== entity),
            });
        } else {
            setSelectedEntities({
                ...selectedEntities,
                [agent]: [...currentSelected, entity],
            });
        }
    };

    const validateSelection = () => {
        const allSelectedEntities = Object.values(selectedEntities).flat();

        if (allSelectedEntities.length !== entityAssignmentStore.entityCount) {
            setErrorMessage('所有实体必须被分配！');
            return false;
        }

        const uniqueEntities = new Set(allSelectedEntities);
        if (uniqueEntities.size !== entityAssignmentStore.entityCount) {
            setErrorMessage('实体不能被重复分配！');
            return false;
        }

        if (sidebarStore.type === '同构多智能体') {
            const requiredCount = entityAssignmentStore.entityCount / sidebarStore.agentCount;
            for (const agent in selectedEntities) {
                if (selectedEntities[agent].length !== requiredCount) {
                    setErrorMessage(`每个智能体必须选择 ${requiredCount} 个实体！`);
                    return false;
                }
            }
        } else if (sidebarStore.type === '异构多智能体') {
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
            for (let i = 1; i <= sidebarStore.agentCount; i++) {
                actionSpaceStore.clearActionsAndRulesForModel(`智能体${i}`);
            }

            stateVectorStore.showCommunication = {};
            stateVectorStore.communicationEntities = {};

            const defaultSelectedStateVectors = {};
            entityAssignmentStore.entities.forEach(entity => {
                if (entity && Array.isArray(entity.stateVector)) {
                    defaultSelectedStateVectors[entity.name] = entity.stateVector.map((_, idx) => idx);
                }
            });

            stateVectorStore.setSelectedStateVectors(defaultSelectedStateVectors);
            onConfirm(selectedEntities);
        }
    };

    const isEntityAssigned = (entity) => {
        return Object.values(selectedEntities).some(entities => entities.includes(entity));
    };

    return (
        <Modal
            title="分配实体"
            open={open}
            onCancel={onCancel}
            onOk={handleConfirm}
            okText="确认"
            cancelText="取消"
            width={800}
            className="entity-assignment-modal"
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
                                onClick={() => setCurrentAgent(agent)}
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
                        dataSource={entityAssignmentStore.entityNames}
                        renderItem={entity => {
                            const isAssigned = isEntityAssigned(entity);
                            const isCurrentAgentAssigned = selectedEntities[currentAgent]?.includes(entity);

                            return (
                                <List.Item className="entity-assignment-modal__entity-item">
                                    <Checkbox
                                        checked={isCurrentAgentAssigned}
                                        onChange={() => handleEntitySelect(currentAgent, entity)}
                                        disabled={sidebarStore.type === '单智能体' || (isAssigned && !isCurrentAgentAssigned)}
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