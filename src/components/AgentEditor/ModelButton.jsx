import { Button, Modal, Table } from 'antd';
import { useState, useEffect } from 'react';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';
import actionSpaceStore from './ActionSpaceStore';
import rewardFunctionStore from './RewardFunctionStore';
import stateVectorStore from './StateVectorStore';

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

        for (let i = 1; i <= sidebarStore.agentCount; i++) {
            actionSpaceStore.clearActionsAndRulesForModel(`智能体${i}`);
        }
        sidebarStore.clearExceptScenario();
        rewardFunctionStore.clearRewards();

        sidebarStore.setScenario(selectedModel.scenarioID, getScenarioName(selectedModel.scenarioID));
        sidebarStore.setRole(selectedModel.agentRoleID, getRoleName(selectedModel.scenarioID, selectedModel.agentRoleID));
        sidebarStore.setType(selectedModel.agentType);
        sidebarStore.setName(selectedModel.agentName);
        sidebarStore.setVersion(selectedModel.agentVersion);
        sidebarStore.setAgentCount(selectedModel.agentCount);
        sidebarStore.modelID = selectedModel.agentID;
        sidebarStore.setLoadingModel(true);

        const assignedEntities = selectedModel.entityAssignments.reduce((acc, assignment) => {
            const [agent, entities] = Object.entries(assignment)[0];
            acc[agent] = entities;
            return acc;
        }, {});

        entityAssignmentStore.setAssignedEntities(assignedEntities);

        selectedModel.rewardFunction.forEach(reward => {
            const [equation, rewardType] = reward;
            const agent = rewardType === '团队奖励' ? '' : rewardType.split('-')[1]; // 提取智能体名称
            rewardFunctionStore.addReward({
                equation: equation,
                type: rewardType === '团队奖励' ? '团队奖励' : '个人奖励',
                agent: agent,
            });
        });
        rewardFunctionStore.setLoadingModel(true);

        selectedModel.agentModel.forEach(agentModel => {
            const agent = agentModel.agentModelName; // 智能体名称，如 "智能体1"
            agentModel.entities.forEach(entity => {
                const entityName = entity.name; // 实体名称，如 "红绿灯1"
                entity.actionSpace.forEach(action => {
                    // 构建动作空间数据
                    const actionData = {
                        entity: entityName,
                        actionType: action.name,
                        mode: action.type,
                        unit: action.action[1], // 单位
                        range: action.action[2], // 取值范围
                        discreteOptions: action.type === '离散型' ? action.action[1] : [], // 离散型动作的可选取值
                        discreteValues: action.type === '离散型' ? action.action[0] : [], // 离散型动作的取值
                        upperLimit: action.type === '连续型' ? action.action[0][1] : '', // 连续型动作的上限
                        lowerLimit: action.type === '连续型' ? action.action[0][0] : '', // 连续型动作的下限
                    };

                    // 更新 ActionSpaceStore 中的动作空间
                    actionSpaceStore.addActionForModel(agent, actionData);

                    // 如果有行为规则，更新 ActionSpaceStore 中的规则
                    if (action.rule) {
                        const uniqueKey = `${entityName}：${action.name}`;
                        actionSpaceStore.setRuleForModel(agent, uniqueKey, {
                            ruleType: action.rule[0],
                            condition1: action.rule[1],
                            condition2: action.rule[2],
                            execution1: action.rule[3],
                            execution2: action.rule[4],
                        });
                    }
                });
            });
        });

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

            // 构建每个智能体模型的实体信息
            const agentModels = Object.entries(entityAssignmentStore.assignedEntities).map(([agent, entities], index) => {
                const agentEntities = entities.map(entityName => {
                    const entity = role.entities.find(e => e.name === entityName);

                    // 获取当前实体的所有动作空间
                    const actionSpaceData = actionSpaceStore.getActionsForModel(agent)
                        .filter(action => action.entity === entityName)
                        .map(action => {
                            const rule = actionSpaceStore.getRuleForModel(agent, `${action.entity}：${action.actionType}`);
                            return {
                                name: action.actionType,
                                type: action.mode,
                                action: action.mode === '连续型'
                                    ? [[action.lowerLimit, action.upperLimit], action.unit, action.range]
                                    : [action.discreteValues, action.discreteOptions],
                                rule: rule ? [rule.ruleType, rule.condition1, rule.condition2, rule.execution1, rule.execution2] : null
                            };
                        });

                    // 获取用户选择的状态向量
                    const selectedStateVectors = stateVectorStore.getSelectedStateVectors()[entityName] || [];
                    const stateVector = entity.stateVector.filter((_, idx) => selectedStateVectors.includes(idx));

                    return {
                        name: entityName,
                        stateVector: stateVector, // 使用用户选择的状态向量
                        actionSpace: actionSpaceData // 新的动作空间结构
                    };
                });

                return {
                    agentModelName: agent, // 智能体名称
                    entities: agentEntities // 实体信息
                };
            });

            // 构建奖励函数信息
            const rewardFunctions = allRewards.map(reward => {
                const rewardType = reward.type === '团队奖励' ? '团队奖励' : `个人奖励-${reward.agent}`;
                return [reward.equation, rewardType];
            });

            // 构建模型数据
            const modelData = {
                agentID: sidebarStore.modelID,
                scenarioID: sidebarStore.scenario,
                agentRoleID: sidebarStore.role,
                agentType: sidebarStore.type,
                agentName: sidebarStore.name,
                agentVersion: sidebarStore.version,
                agentCount: sidebarStore.agentCount,
                entityAssignments: Object.entries(entityAssignmentStore.assignedEntities).map(([agent, entities]) => ({
                    [agent]: entities
                })),
                agentModel: agentModels, // 智能体模型列表
                rewardFunction: rewardFunctions, // 奖励函数列表
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
        {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            render: (text, record, index) => index + 1,
        },
        {
            title: '智能体名称',
            dataIndex: 'agentName',
            key: 'agentName',
        },
        {
            title: '智能体版本',
            dataIndex: 'agentVersion',
            key: 'agentVersion',
        },
        {
            title: '场景',
            dataIndex: 'scenarioID',
            key: 'scenarioID',
            render: (scenarioID) => getScenarioName(scenarioID),
        },
        {
            title: '智能体角色',
            dataIndex: 'agentRoleID',
            key: 'agentRoleID',
            render: (agentRoleID, record) => getRoleName(record.scenarioID, agentRoleID),
        },
        {
            title: '智能体类型',
            dataIndex: 'agentType',
            key: 'agentType',
        },
        {
            title: '智能体数量',
            dataIndex: 'agentCount',
            key: 'agentCount',
        },
    ];

    const tableData = models.map((model, index) => ({
        ...model,
        key: index,
    }));

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