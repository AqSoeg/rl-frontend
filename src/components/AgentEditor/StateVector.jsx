import { useState, useEffect } from 'react';
import { Button, Table, Checkbox } from 'antd';
import stateLogo from '../../assets/stateVector.svg';
import communicationLogo from '../../assets/communication.svg';
import entityAssignmentStore from './EntityAssignmentStore';
import stateVectorStore from './StateVectorStore';
import sidebarStore from './SidebarStore';

const StateVector = ({ entities }) => {
    const [visible, setVisible] = useState([]);
    const [selectedVector, setSelectedVector] = useState(null);
    const [selectedVectorIndex, setSelectedVectorIndex] = useState(null);
    const [selectedRows, setSelectedRows] = useState({});
    const [displayEntities, setDisplayEntities] = useState([]);
    const [isCommunicationEnabled, setIsCommunicationEnabled] = useState(false);

    useEffect(() => {
        const selectedStateVectors = stateVectorStore.getSelectedStateVectors();
        if (Object.keys(selectedStateVectors).length > 0) {
            setSelectedRows(selectedStateVectors);
        } else {
            const initialSelectedRows = {};
            entities.forEach(entity => {
                initialSelectedRows[entity.name] = entity.stateVector.map((_, idx) => idx);
            });
            setSelectedRows(initialSelectedRows);
        }
    }, [entities]);

    useEffect(() => {
        stateVectorStore.setSelectedStateVectors(selectedRows);
    }, [selectedRows]);

    useEffect(() => {
        const updateEntities = () => {
            if (entityAssignmentStore.isAgentSelected) {
                const selectedAgent = entityAssignmentStore.selectedAgent;
                const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
                const assignedEntityObjects = entities.filter(entity =>
                    assignedEntities.includes(entity.name)
                );
                const communicationEntities = stateVectorStore.getCommunicationEntities(selectedAgent);
                const allDisplayEntities = [...assignedEntityObjects, ...communicationEntities];
                setDisplayEntities(allDisplayEntities);
                setVisible(Array(allDisplayEntities.length).fill(false));
                setIsCommunicationEnabled(
                    sidebarStore.type !== '单智能体' && !!selectedAgent
                );
            } else {
                setDisplayEntities([]);
                setVisible([]);
                setIsCommunicationEnabled(false);
            }
        };

        updateEntities();
        const unsubscribe = entityAssignmentStore.subscribe(updateEntities);
        return () => unsubscribe();
    }, [entities]);

    const handleCommunicationToggle = () => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            stateVectorStore.toggleCommunication(selectedAgent);
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
            const assignedEntityObjects = entities.filter(entity =>
                assignedEntities.includes(entity.name)
            );
            const communicationEntities = stateVectorStore.getCommunicationEntities(selectedAgent);
            const allDisplayEntities = [...assignedEntityObjects, ...communicationEntities];
            setDisplayEntities(allDisplayEntities);
            setVisible(Array(allDisplayEntities.length).fill(false));

            const newSelectedRows = { ...selectedRows };
            communicationEntities.forEach(entity => {
                if (!newSelectedRows[entity.name]) {
                    newSelectedRows[entity.name] = [];
                }
            });
            setSelectedRows(newSelectedRows);
        }
    };

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedVector(displayEntities[index]);
        setSelectedVectorIndex(index);
    };

    const handleSelectAll = (entityName, selected) => {
        const newSelectedRows = { ...selectedRows };
        const entity = displayEntities.find(e => e.name === entityName);
        if (entity && Array.isArray(entity.stateVector)) {
            if (selected) {
                newSelectedRows[entityName] = entity.stateVector.map((_, idx) => idx);
            } else {
                newSelectedRows[entityName] = [];
            }

            if (sidebarStore.type === '同构多智能体') {
                const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
                const entityGroup = agentEntityMapping.find(group =>
                    Object.keys(group).some(name => name.replace('通信-', '') === entityName.replace('通信-', ''))
                );
                if (entityGroup) {
                    Object.entries(entityGroup).forEach(([name, agent]) => {
                        const mappedName = entity.isCommunication
                            ? `通信-${Object.keys(entityGroup).find(k => entityGroup[k] !== agent)}`
                            : name;
                        if (mappedName !== entityName && mappedName.replace('通信-', '') !== entityName.replace('通信-', '')) {
                            newSelectedRows[mappedName] = [...newSelectedRows[entityName]];
                        }
                    });
                }
            }

            setSelectedRows(newSelectedRows);
        }
    };

    const handleRowSelect = (entityName, rowIndex) => {
        const newSelectedRows = { ...selectedRows };
        if (!newSelectedRows[entityName]) {
            newSelectedRows[entityName] = [];
        }
        if (newSelectedRows[entityName].includes(rowIndex)) {
            newSelectedRows[entityName] = newSelectedRows[entityName].filter(idx => idx !== rowIndex);
        } else {
            newSelectedRows[entityName].push(rowIndex);
        }

        if (sidebarStore.type === '同构多智能体') {
            const agentEntityMapping = entityAssignmentStore.agentEntityMapping;
            const entityGroup = agentEntityMapping.find(group =>
                Object.keys(group).some(name => name.replace('通信-', '') === entityName.replace('通信-', ''))
            );
            if (entityGroup) {
                const entity = displayEntities.find(e => e.name === entityName);
                Object.entries(entityGroup).forEach(([name, agent]) => {
                    const mappedName = entity.isCommunication
                        ? `通信-${Object.keys(entityGroup).find(k => entityGroup[k] !== agent)}`
                        : name;
                    if (mappedName !== entityName && mappedName.replace('通信-', '') !== entityName.replace('通信-', '')) {
                        if (!newSelectedRows[mappedName]) {
                            newSelectedRows[mappedName] = [];
                        }
                        if (newSelectedRows[entityName].includes(rowIndex)) {
                            newSelectedRows[mappedName].push(rowIndex);
                        } else {
                            newSelectedRows[mappedName] = newSelectedRows[mappedName].filter(idx => idx !== rowIndex);
                        }
                    }
                });
            }
        }

        setSelectedRows(newSelectedRows);
    };

    const columns = [
        {
            title: '选择',
            dataIndex: 'select',
            key: 'select',
            render: (_, record, rowIndex) => (
                <Checkbox
                    checked={selectedRows[record.entityName]?.includes(rowIndex) || false}
                    onChange={() => handleRowSelect(record.entityName, rowIndex)}
                />
            ),
        },
        { title: '变量名称', dataIndex: 'name', key: 'name' },
        { title: '变量信息', dataIndex: 'info', key: 'info' },
        { title: '单位', dataIndex: 'unit', key: 'unit' },
    ];

    const getTableData = (vector) => {
        if (!vector || !Array.isArray(vector.stateVector) || vector.stateVector.length === 0) {
            return [{ name: '', info: '', unit: '' }];
        }
        return vector.stateVector.map(([name, info, unit], idx) => ({
            name,
            info,
            unit,
            key: idx,
            entityName: vector.name,
        }));
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={stateLogo} alt="StateVector" className="sub-component-logo"/>
                <div className="sub-component-title">状态向量</div>
            </div>
            <div className="upload-button">
                <img
                    src={communicationLogo}
                    alt="Toggle Communication"
                    className="upload-button-logo"
                    onClick={isCommunicationEnabled ? handleCommunicationToggle : undefined}
                    onKeyDown={(e) => {
                        if (isCommunicationEnabled && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            handleCommunicationToggle();
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-disabled={!isCommunicationEnabled}
                    style={{
                        cursor: isCommunicationEnabled ? 'pointer' : 'not-allowed',
                        opacity: isCommunicationEnabled ? 1 : 0.5,
                    }}
                />
            </div>
            <div className="dropdown-container-wrapper">
                {entityAssignmentStore.isAgentSelected && displayEntities?.map((entity, i) => (
                    <div key={i} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>{entity.name}</span>
                            <Button type="link" className="dropdown-button">
                                {visible[i] ? '▲' : '▼'}
                            </Button>
                        </div>
                        {visible[i] && (
                            <div className="table-container">
                                <Table
                                    columns={[
                                        {
                                            title: (
                                                <Checkbox
                                                    checked={selectedRows[entity.name]?.length === entity.stateVector?.length}
                                                    onChange={(e) => handleSelectAll(entity.name, e.target.checked)}
                                                />
                                            ),
                                            dataIndex: 'select',
                                            key: 'select',
                                            render: (_, record, rowIndex) => (
                                                <Checkbox
                                                    checked={selectedRows[entity.name]?.includes(rowIndex) || false}
                                                    onChange={() => handleRowSelect(record.entityName, rowIndex)}
                                                />
                                            ),
                                        },
                                        ...columns.slice(1),
                                    ]}
                                    dataSource={getTableData(entity)}
                                    pagination={false}
                                    scroll={{y: 240}}
                                    className="fixed-table"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StateVector;