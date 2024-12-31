import { useState, useEffect } from 'react';
import { Button, Table, Checkbox } from 'antd';
import stateLogo from '../../assets/stateVector.svg';
import uploadLogo from '../../assets/upload.svg';
import entityAssignmentStore from './EntityAssignmentStore';
import stateVectorStore from './StateVectorStore'; // 引入 StateVectorStore

const StateVector = ({ entities }) => {
    const [visible, setVisible] = useState(Array(entities?.length || 0).fill(false));
    const [selectedVector, setSelectedVector] = useState(null);
    const [selectedVectorIndex, setSelectedVectorIndex] = useState(null);
    const [selectedRows, setSelectedRows] = useState({}); // 记录每张表格中选中的行
    const [agentSelectionState, setAgentSelectionState] = useState({}); // 存储每个智能体的选择状态

    // 初始化 selectedRows，根据当前智能体的选择状态恢复
    useEffect(() => {
        if (!entities || !Array.isArray(entities)) {
            console.error("entities is not defined or not an array");
            return;
        }

        const selectedAgent = entityAssignmentStore.selectedAgent;
        if (selectedAgent && agentSelectionState[selectedAgent]) {
            // 如果当前智能体有存储的选择状态，则恢复
            setSelectedRows(agentSelectionState[selectedAgent]);
        } else {
            // 否则初始化为全选
            const initialSelectedRows = {};
            entities.forEach(entity => {
                if (!entity || typeof entity !== 'object' || !entity.name || !Array.isArray(entity.stateVector)) {
                    console.error(`Invalid entity or stateVector for entity: ${entity?.name || 'unknown'}`);
                    return;
                }
                initialSelectedRows[entity.name] = entity.stateVector.map((_, idx) => idx);
            });
            setSelectedRows(initialSelectedRows);
        }
    }, [entities, entityAssignmentStore.selectedAgent]);

    // 当 selectedRows 变化时，更新当前智能体的选择状态
    useEffect(() => {
        const selectedAgent = entityAssignmentStore.selectedAgent;
        if (selectedAgent) {
            setAgentSelectionState(prevState => ({
                ...prevState,
                [selectedAgent]: selectedRows,
            }));
            stateVectorStore.setSelectedStateVectors(selectedRows); // 更新 StateVectorStore
        }
    }, [selectedRows]);

    useEffect(() => {
        if (entityAssignmentStore.isAgentSelected) {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
            setVisible(Array(assignedEntities.length).fill(false));
        } else {
            setVisible([]);
        }
    }, [entityAssignmentStore.isAgentSelected, entityAssignmentStore.selectedAgent, entityAssignmentStore.assignedEntities]);

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedVector(entities[index]);
        setSelectedVectorIndex(index);
    };

    // 处理全选
    const handleSelectAll = (entityName, selected) => {
        const newSelectedRows = { ...selectedRows };
        const entity = entities.find(e => e.name === entityName);
        if (entity && Array.isArray(entity.stateVector)) {
            if (selected) {
                newSelectedRows[entityName] = entity.stateVector.map((_, idx) => idx);
            } else {
                newSelectedRows[entityName] = [];
            }
            setSelectedRows(newSelectedRows);
        }
    };

    // 处理单行选择
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
            entityName: vector.name, // 添加实体名称
        }));
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={stateLogo} alt="StateVector" className="sub-component-logo" />
                <div className="sub-component-title">状态向量</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt="Upload" className="upload-button-logo" />
            </div>
            <div className="dropdown-container-wrapper">
                {entityAssignmentStore.isAgentSelected && entities?.map((entity, i) => (
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
                                                    onChange={() => handleRowSelect(entity.name, rowIndex)}
                                                />
                                            ),
                                        },
                                        ...columns.slice(1),
                                    ]}
                                    dataSource={getTableData(entity)}
                                    pagination={false}
                                    scroll={{ y: 240 }}
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