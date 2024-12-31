// ModelButton.jsx
import { Button, Modal, Table } from 'antd';
import { useState, useEffect } from 'react';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';
import actionSpaceStore from './ActionSpaceStore';
import rewardFunctionStore from './RewardFunctionStore';
import stateVectorStore from './StateVectorStore'; // 引入 StateVectorStore

const ModelFunction = ({ scenarios }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connected');
            ws.send(JSON.stringify({ type: 'getModels' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'models') {
                setModels(data.models);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => ws.close();
    }, []);

    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    const handleModelConfirm = () => {
        if (!selectedModel) {
            alert('请选择一个智能体模型！');
            return;
        }

        if (!Array.isArray(selectedModel.entityAssignments) || selectedModel.entityAssignments.length === 0) {
            alert('选择的模型中没有实体分配信息！');
            return;
        }

        const assignedEntities = selectedModel.entityAssignments.reduce((acc, assignment) => {
            const agent = Object.keys(assignment)[0];
            acc[agent] = assignment[agent];
            return acc;
        }, {});

        sidebarStore.clearExceptScenario();
        entityAssignmentStore.clearAssignment();

        sidebarStore.setScenario(selectedModel.scenarioID);
        sidebarStore.setRole(selectedModel.agentRoleID);
        sidebarStore.setType(selectedModel.agentType);
        sidebarStore.setName(selectedModel.agentName);
        sidebarStore.setVersion(selectedModel.agentVersion);
        sidebarStore.setAgentCount(Object.keys(assignedEntities).length.toString());
        sidebarStore.setModelID(selectedModel.agentID);

        entityAssignmentStore.setAssignedEntities(assignedEntities);

        setIsModalVisible(false);
    };

    const handleModelCancel = () => {
        setIsModalVisible(false);
    };

    const handleSaveModel = () => {
        if (!sidebarStore.canSaveModel()) {
            alert('请填写完整信息后再保存模型！');
            return;
        }

        const confirmSave = window.confirm('是否确认保存模型？');
        if (confirmSave) {
            const scenario = scenarios.find(s => s.id === sidebarStore.scenario);
            const role = scenario.roles.find(r => r.id === sidebarStore.role);

            // 获取所有奖励函数
            const allRewards = rewardFunctionStore.getAllRewards();

            // 获取实体的状态向量、动作空间和奖励函数
            const entities = entityAssignmentStore.assignedEntities[sidebarStore.selectedAgent].map(entityName => {
                const entity = role.entities.find(e => e.name === entityName);

                // 获取当前实体的所有动作空间
                const actionSpaceData = actionSpaceStore.getActionsForModel(entityAssignmentStore.selectedAgent)
                    .filter(action => action.entity === entityName)
                    .map(action => {
                        const rule = actionSpaceStore.getRuleForModel(entityAssignmentStore.selectedAgent, `${action.entity}：${action.actionType}`);
                        return {
                            name: action.actionType,
                            type: action.mode,
                            action: action.mode === '连续型'
                                ? [[action.lowerLimit, action.upperLimit], action.unit, action.range]
                                : [action.discreteValues, action.discreteOptions],
                            rule: rule ? [rule.ruleType, rule.condition1, rule.condition2, rule.execution1, rule.execution2] : null
                        };
                    });

                // 过滤出与当前实体相关的奖励函数
                const rewardFunction = allRewards
                    .filter(reward => {
                        // 如果是团队奖励，或者奖励的智能体与当前智能体匹配
                        return reward.type === '团队奖励' || reward.agent === sidebarStore.selectedAgent;
                    })
                    .map(reward => [reward.equation, reward.type]); // 映射为 [公式, 类型]

                // 获取用户选择的状态向量
                const selectedStateVectors = stateVectorStore.getSelectedStateVectors()[entityName] || [];
                const stateVector = entity.stateVector.filter((_, idx) => selectedStateVectors.includes(idx));

                return {
                    name: entityName,
                    stateVector: stateVector, // 使用用户选择的状态向量
                    actionSpace: actionSpaceData, // 新的动作空间结构
                    rewardFunction: rewardFunction
                };
            });

            // 构建模型数据
            const modelData = {
                scenarioID: sidebarStore.scenario,
                agentRoleID: sidebarStore.role,
                agentType: sidebarStore.type,
                agentName: sidebarStore.name,
                agentVersion: sidebarStore.version,
                agentID: sidebarStore.modelID,
                agentModelName: sidebarStore.selectedAgent,
                entityAssignments: Object.entries(entityAssignmentStore.assignedEntities).map(([agent, entities]) => ({
                    [agent]: entities
                })),
                entities: entities, // 包含实体的状态向量、动作空间和奖励函数
                updateTime: new Date().toISOString()
            };

            // 通过 WebSocket 发送数据
            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                ws.send(JSON.stringify(modelData));
                ws.close();
            };

            ws.onmessage = (event) => {
                const response = JSON.parse(event.data);
                if (response.status === 'success') {
                    alert('模型保存成功！');
                } else {
                    alert('模型保存失败，请重试！');
                }
            };
        }
    };

    const handleLoadModel = () => {
        setIsModalVisible(true);
    };

    const getScenarioName = (scenarioID) => {
        const scenario = scenarios.find(s => s.id === scenarioID);
        return scenario ? scenario.name : '未知场景';
    };

    const getRoleName = (scenarioID, roleID) => {
        const scenario = scenarios.find(s => s.id === scenarioID);
        if (!scenario) {
            return '未知角色';
        }

        const role = scenario.roles.find(r => r.id === roleID);
        return role ? role.name : '未知角色';
    };

    const columns = [
        { title: '序号', dataIndex: 'index', key: 'index' },
        { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
        { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
        { title: '场景', dataIndex: 'scenarioName', key: 'scenarioName' },
        { title: '智能体角色', dataIndex: 'roleName', key: 'roleName' },
        { title: '分配的实体名称', dataIndex: 'assignedEntities', key: 'assignedEntities' },
    ];

    const tableData = models.map((model, index) => {
        const assignedEntities = model.entityAssignments.reduce((acc, assignment) => {
            const agent = Object.keys(assignment)[0];
            acc[agent] = assignment[agent];
            return acc;
        }, {});

        return {
            key: model.agentID,
            index: index + 1,
            agentID: model.agentID,
            agentName: `${model.agentName} v${model.agentVersion} ${model.agentModelName}`,
            scenarioName: getScenarioName(model.scenarioID),
            roleName: getRoleName(model.scenarioID, model.agentRoleID),
            assignedEntities: Object.values(assignedEntities).flat().join(', '),
        };
    });

    return (
        <div className="model-button-container">
            <Button className="model-button" onClick={handleLoadModel}>载入模型</Button>
            <Button className="model-button" onClick={handleSaveModel}>保存模型</Button>

            <Modal
                title="请选择载入的智能体模型"
                open={isModalVisible}
                onOk={handleModelConfirm}
                onCancel={handleModelCancel}
                okText="确认"
                cancelText="取消"
            >
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowSelection={{
                        type: 'radio',
                        onChange: (selectedRowKeys, selectedRows) => {
                            handleModelSelect(selectedRows[0]);
                        },
                    }}
                    pagination={false}
                />
            </Modal>
        </div>
    );
};

export default ModelFunction;