import {Button, Modal, Table} from 'antd';
import {useEffect, useState} from 'react';
import sidebarStore from './SidebarStore';
import entityAssignmentStore from './EntityAssignmentStore';
import stateVectorStore from './StateVectorStore';
import actionSpaceStore from './ActionSpaceStore';
import rewardFunctionStore from './RewardFunctionStore';

const ModelFunction = ({scenarios}) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);

    const fetchModels = async () => {
        try {
            const response = await fetch(__APP_CONFIG__.getModels, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (data.models) {
                setModels(data.models);
            }
        } catch (error) {
            console.error('模型加载失败:', error);
        }
    };

    useEffect(() => {
        fetchModels();
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
        sidebarStore.setSelectedAgent('智能体1');
        sidebarStore.modelID = selectedModel.agentID;
        sidebarStore.setLoadingModel(true);

        const assignedEntities = selectedModel.entityAssignments.reduce((acc, assignment) => {
            const [agent, entities] = Object.entries(assignment)[0];
            acc[agent] = entities;
            return acc;
        }, {});
        const allEntities = Object.values(assignedEntities).flat();
        allEntities.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', {numeric: true}));
        entityAssignmentStore.entityNames = allEntities;
        entityAssignmentStore.entityCount = allEntities.length;
        entityAssignmentStore.entities = scenarios.find(s => s.id === selectedModel.scenarioID).roles.find(r => r.id === selectedModel.agentRoleID).entities;
        entityAssignmentStore.setAssignedEntities(assignedEntities);
        entityAssignmentStore.setSelectedAgent('智能体1');

        const agent1Model = selectedModel.agentModel.find(model => model.name === '智能体1');
        if (agent1Model) {
            agent1Model.rewardFunction.forEach(reward => {
                const [equation, rewardType] = reward;
                if (rewardType === '团队奖励') {
                    rewardFunctionStore.addReward({
                        equation: equation,
                        type: '团队奖励',
                        agent: '',
                    });
                }
            });
        }
        selectedModel.agentModel.forEach(agentModel => {
            agentModel.rewardFunction.forEach(reward => {
                const [equation, rewardType] = reward;
                if (rewardType.startsWith('个人奖励')) {
                    const agent = rewardType.split('-')[1];
                    rewardFunctionStore.addReward({
                        equation: equation,
                        type: '个人奖励',
                        agent: agent,
                    });
                }
            });
        });
        rewardFunctionStore.setLoadingModel(true);

        selectedModel.agentModel.forEach(agentModel => {
            const agent = agentModel.name;
            agentModel.actionSpace.forEach(action => {
                const actionData = {
                    entity: action.entity,
                    actionType: action.name,
                    mode: action.type,
                    unit: action.action[1],
                    range: action.action[2],
                    discreteOptions: action.type === '离散型' ? action.action[1] : [],
                    discreteValues: action.type === '离散型' ? action.action[0] : [],
                    upperLimit: action.type === '连续型' ? action.action[0][1].toString() : '',
                    lowerLimit: action.type === '连续型' ? action.action[0][0].toString() : '',
                };
                actionSpaceStore.addActionForModel(agent, actionData);

                if (action.rules && action.rules.length > 0) {
                    const uniqueKey = `${action.entity}：${action.name}`;
                    action.rules.forEach((rule, index) => {
                        actionSpaceStore.setRuleForModel(
                            agent,
                            uniqueKey,
                            {
                                ruleType: rule[0],
                                condition: rule[1],
                                execution1: rule[2],
                                execution2: rule[3]
                            },
                            index + 1
                        );
                    });
                }
            });
        });

        const defaultSelectedStateVectors = {};
        entityAssignmentStore.entities.forEach(entity => {
            if (entity && Array.isArray(entity.stateVector)) {
                defaultSelectedStateVectors[entity.name] = entity.stateVector.map((_, idx) => idx);
            }
        });

        stateVectorStore.setSelectedStateVectors(defaultSelectedStateVectors);

        setIsModalVisible(false);
    };

    const handleModelCancel = () => {
        setIsModalVisible(false);
    };

    const handleSaveModel = async () => {
        if (!sidebarStore.canSaveModel()) {
            alert('请填写完整信息后再保存模型！');
            return;
        }

        const confirmSave = window.confirm('是否确认保存模型？');
        if (confirmSave) {
            const scenario = scenarios.find(s => s.id === sidebarStore.scenario);
            const role = scenario.roles.find(r => r.id === sidebarStore.role);

            const allRewards = rewardFunctionStore.getAllRewards();

            const agentModels = Object.entries(entityAssignmentStore.assignedEntities).map(([agent, entities]) => {
                const agentEntities = entities.map(entityName => {
                    const entity = role.entities.find(e => e.name === entityName);

                    const actionSpaceData = actionSpaceStore.getActionsForModel(agent)
                        .filter(action => action.entity === entityName)
                        .map(action => {
                            const uniqueKey = `${action.entity}：${action.actionType}`;
                            const allRules = actionSpaceStore.getAllRulesForAction(agent, uniqueKey);
                            const rulesArray = allRules.map(rule => [
                                rule.ruleType,
                                rule.condition,
                                rule.execution1,
                                rule.execution2
                            ]);

                            return {
                                entity: entityName,
                                name: action.actionType,
                                type: action.mode,
                                action: action.mode === '连续型'
                                    ? [[parseFloat(action.lowerLimit), parseFloat(action.upperLimit)], action.unit, action.range]
                                    : [action.discreteValues, action.discreteOptions],
                                rules: rulesArray.length > 0 ? rulesArray : undefined
                            };
                        });

                    const selectedStateVectors = stateVectorStore.getSelectedStateVectors()[entityName] || [];
                    const stateVector = entity.stateVector.filter((_, idx) => selectedStateVectors.includes(idx));
                    const stateVectorWithEntityName = stateVector.map(vector => [entityName, ...vector]);

                    return {
                        name: entityName,
                        stateVector: stateVectorWithEntityName,
                        actionSpace: actionSpaceData
                    };
                });

                const communicationEntities = stateVectorStore.getCommunicationEntities(agent).map(commEntity => {
                    const baseEntityName = commEntity.name.replace('通信-', '');
                    const entity = role.entities.find(e => e.name === baseEntityName);

                    const selectedStateVectors = stateVectorStore.getSelectedStateVectors()[commEntity.name] || [];
                    const stateVector = entity.stateVector.filter((_, idx) => selectedStateVectors.includes(idx));
                    const stateVectorWithEntityName = stateVector.map(vector => [baseEntityName, ...vector]);

                    return {
                        name: baseEntityName,
                        stateVector: stateVectorWithEntityName,
                        actionSpace: []
                    };
                });

                const allAgentEntities = [...agentEntities, ...communicationEntities];

                const agentRewards = allRewards.filter(reward => {
                    if (reward.type === '团队奖励') {
                        return true;
                    } else {
                        return reward.agent === agent;
                    }
                }).map(reward => {
                    const rewardType = reward.type === '团队奖励' ? '团队奖励' : `个人奖励-${reward.agent}`;
                    return [reward.equation, rewardType];
                });

                return {
                    name: agent,
                    stateVector: allAgentEntities.flatMap(entity => entity.stateVector),
                    actionSpace: allAgentEntities.flatMap(entity => entity.actionSpace),
                    rewardFunction: agentRewards
                };
            });

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
                agentModel: agentModels,
                updateTime: new Date().toISOString()
            };

            try {
                const response = await fetch(__APP_CONFIG__.saveModel, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(modelData),
                });

                const result = await response.json();
                if (result.status === 'success') {
                    alert('模型保存成功！');
                    fetchModels();
                } else {
                    alert('模型保存失败，请重试！');
                }
            } catch (error) {
                console.error('Error saving model:', error);
                alert('模型保存失败，请检查网络连接！');
            }
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