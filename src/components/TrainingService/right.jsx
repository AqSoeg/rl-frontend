import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Space, Button, Modal, Table, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';

const { Option } = Select;

const Right = observer(({ decisionModels, fetchDecisions }) => {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isModelListModalVisible, setIsModelListModalVisible] = useState(false);
  const [isModelInfoModalVisible, setIsModelInfoModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [training, setTraining] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [hyperParametersValues, setHyperParametersValues] = useState({});
  const [effectImageUrl, setEffectImageUrl] = useState(null);
  const [isEffectImageModalVisible, setIsEffectImageModalVisible] = useState(false);
  const [modelList, setModelList] = useState([]); // 用于保存训练好的模型列表

  // 获取智能体列表
  const fetchAgents = async () => {
    try {
      const requestBody = {
        scenarioID: intelligentStore.selectedScenario.id,
        agentRoleID: intelligentStore.selectedAgentRole.id,
      };

      const response = await fetch(__APP_CONFIG__.getModels, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const data = await response.json();
      const models = data.models;

      const filteredAgents = models.filter(
        (agent) =>
          agent.scenarioID === intelligentStore.selectedScenario.id &&
          agent.agentRoleID === intelligentStore.selectedAgentRole.id
      );

      setAgents(filteredAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  // 当场景或智能体角色发生变化时，重新获取智能体列表
  useEffect(() => {
    if (intelligentStore.selectedScenario && intelligentStore.selectedAgentRole) {
      fetchAgents();
    }
  }, [intelligentStore.selectedScenario, intelligentStore.selectedAgentRole]);

  // 初始化超参数值
  useEffect(() => {
    if (intelligentStore.selectedAlgorithm && intelligentStore.selectedAlgorithm['hyper-parameters']) {
      const initialParams = intelligentStore.selectedAlgorithm['hyper-parameters'].reduce((acc, param) => {
        acc[param.id] = param.default;
        return acc;
      }, {});
      setHyperParametersValues(initialParams);
    }
  }, [intelligentStore.selectedAlgorithm]);

  useEffect(() => {
    setSelectedAgent(null); // 清除之前载入的智能体信息
    setTraining(false); // 重置训练状态
    intelligentStore.loadAgent(null); // 清除 IntelligentStore 中的智能体信息
  }, [intelligentStore.selectedAlgorithm]);

  const isModelCompatibleWithAlgorithm = (model, algorithm) => {
    if (algorithm.type_name === "单智能体" && model.agentType !== "单智能体") {
      return false;
    }

    if (model.agentType === "异构多智能体" && algorithm.type_name !== "分布式多智能体") {
      return false;
    }

    if (model.agentType === "同构多智能体" && !["分布式多智能体", "共享多智能体"].includes(algorithm.type_name)) {
      return false;
    }

    return true;
  };

  const trainAlgorithm = async () => {
    const selectedAgent = intelligentStore.selectedAgent;
    const selectedAlgorithm = intelligentStore.selectedAlgorithm;

    if (!selectedAgent) {
      message.error("请先载入智能体！");
      return;
    }

    if (!selectedAlgorithm) {
      message.error("请先选择算法！");
      return;
    }

    if (!isModelCompatibleWithAlgorithm(selectedAgent, selectedAlgorithm)) {
      message.error("模型与算法类型不匹配，无法训练！");
      return;
    }

    setTraining(true); // 开始训练时设置训练状态为 true
    try {
      const requestBody = {
        agentInfo: {
          agentID: selectedAgent.agentID,
          agentName: selectedAgent.agentName,
          agentType: selectedAgent.agentType,
          scenarioID: selectedAgent.scenarioID,
          agentRoleID: selectedAgent.agentRoleID,
        },
        algorithmInfo: {
          algorithmType: selectedAlgorithm.type,
          algorithmName: selectedAlgorithm.name,
          hyperParameters: hyperParametersValues,
        },
        scenarioEditInfo: {
          scenarioName: intelligentStore.selectedScenario.name,
          entities: intelligentStore.selectedAgentRole.id
        },
      };

      const response = await fetch(__APP_CONFIG__.train, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        message.success('训练已开始！');
        const checkTrainingStatus = async () => {
          const statusResponse = await fetch(__APP_CONFIG__.training_status);
          const statusData = await statusResponse.json();
          if (statusData.status === "completed") {
            setTraining(false); // 训练完成时设置训练状态为 false
            if (statusData.result.status === "success") {
              message.success('训练完成，模型已保存！');
              fetchDecisions();
            } else if (statusData.result.status === "stopped") {
              message.warning('训练已终止，模型未保存');
            } else {
              message.error('训练失败，请检查日志');
            }
          } else {
            setTimeout(checkTrainingStatus, 1000);
          }
        };
        checkTrainingStatus();
      } else {
        setTraining(false); // 训练失败时设置训练状态为 false
        message.error('训练失败，请检查日志');
      }
    } catch (error) {
      setTraining(false); // 训练失败时设置训练状态为 false
      console.error('训练过程中发生错误:', error);
      message.error('训练失败，请检查日志');
    }
  };

  const stopTraining = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.stop_training, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setTraining(false); // 终止训练时设置训练状态为 false
        message.success('训练终止请求已发送');
      } else {
        message.error('训练终止失败，请检查日志');
      }
    } catch (error) {
      console.error('训练终止失败:', error);
      message.error('训练终止失败，请检查网络或联系管理员');
    }
  };

  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalVisible(true);
  };

  const handleLoad = (agent) => {
    const selectedAlgorithm = intelligentStore.selectedAlgorithm;
    if (!selectedAlgorithm) {
      message.error("请先选择算法！");
      return;
    }

    if (!isModelCompatibleWithAlgorithm(agent, selectedAlgorithm)) {
      message.error("模型与算法类型不匹配，无法载入！");
      return;
    }

    intelligentStore.loadAgent(agent);
    message.success("智能体载入成功！");
  };

  const handleViewModelListClick = () => {
    setIsModelListModalVisible(true);
  };

  const handleViewModel = (model) => {
    setCurrentModel(model);
    setIsModelInfoModalVisible(true);
  };

  const handleEffectModel = async (record) => {
    try {
      const response = await fetch(__APP_CONFIG__.get_effect, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decisionModelID: record.AGENT_MODEL_ID }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setEffectImageUrl(data.img_url);
        setIsEffectImageModalVisible(true);
      } else {
        message.error('获取效果图片失败，请检查日志');
      }
    } catch (error) {
      console.error('获取效果图片失败:', error);
      message.error('获取效果图片失败，请检查网络或联系管理员');
    }
  };

  const scenarioColumns = [
    {
      title: '序号',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', render: time => new Date(time).toLocaleString() },
    {
      title: '实体分配',
      dataIndex: 'entityAssignments',
      key: 'entityAssignments',
      render: (text, record) => {
        const assignments = record.entityAssignments.map((assignment, index) => {
          const agentName = Object.keys(assignment)[0];
          const entities = assignment[agentName].join(', ');
          return `${agentName}: ${entities}`;
        });

        return (
          <div>
            {assignments.map((assignment, index) => (
              <div key={index}>{assignment}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleView(record)}>查看</Button>
          <Button type="primary" onClick={() => handleLoad(record)}>载入</Button>
        </div>
      ),
    },
  ];

  const modelListColumns = [
    { title: '决策模型ID', dataIndex: 'AGENT_MODEL_ID', key: 'AGENT_MODEL_ID' },
    { title: '智能体名称', dataIndex: 'AGENT_NAME', key: 'AGENT_NAME' },
    { title: '场景名称', dataIndex: 'SCENARIO_NAME', key: 'SCENARIO_NAME' },
    { title: '角色名称', dataIndex: 'ROLE_NAME', key: 'ROLE_NAME' },
    { title: '模型版本', dataIndex: 'AGENT_MODEL_VERSION', key: 'AGENT_MODEL_VERSION' },
    { title: '模型类型', dataIndex: 'NN_MODEL_TYPE', key: 'NN_MODEL_TYPE' },
    { title: '创建时间', dataIndex: 'CREAT_TIME', key: 'CREAT_TIME', render: time => new Date(time).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleViewModel(record)}>查看</Button>
          <Button type="primary" onClick={() => handleEffectModel(record)}>效果</Button>
        </div>
      ),
    },
  ];



  return (
    <div className='right1' style={{ height: '80vh' }}>
      {intelligentStore.selectedScenario && intelligentStore.selectedAgentRole && (
        <Card title="已选想定场景、智能体角色的智能体设计列表" bordered={true}>
          <Table
            columns={scenarioColumns}
            dataSource={agents}
            pagination={{ pageSize: 4, showQuickJumper: true }}
            bordered
            rowKey="agentID"
          />
        </Card>
      )}

      {intelligentStore.selectedAlgorithm && intelligentStore.selectedAlgorithm['hyper-parameters'] && (
        <Card title="训练超参数" bordered={true}>
          <Row gutter={[16, 16]}>
            {intelligentStore.selectedAlgorithm['hyper-parameters'].map((param, index) => {
              const uniqueValues = [...new Set(param.value)].sort((a, b) => a - b);
              const defaultValueExists = uniqueValues.includes(param.default);
              const defaultValue = defaultValueExists ? param.default : uniqueValues[0];

              return (
                <Col key={index} span={8}>
                  <Space align="baseline" style={{ marginBottom: 8 }}>
                    <span>{param.name}:</span>
                    <Select
                      defaultValue={defaultValue}
                      onChange={(value) => {
                        setHyperParametersValues(prevState => ({
                          ...prevState,
                          [param.id]: value
                        }));
                      }}
                      style={{ width: '100%' }}
                    >
                      {uniqueValues.map((value, idx) => (
                        <Option key={`${param.id}-${idx}`} value={value}>
                          {value}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      <div className="button-container">
        <Button onClick={trainAlgorithm} disabled={training}>
          {training ? '训练中...' : '开始训练'}
        </Button>
        <Button onClick={handleViewModelListClick}>查看模型列表</Button>
        <Button onClick={stopTraining} disabled={!training}>
          终止训练
        </Button>
      </div>

      {/* 智能体详情弹窗 */}
      <Modal
        title="智能体详情"
        open={isDetailModalVisible}
        onOk={() => setIsDetailModalVisible(false)}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAgent && (
          <div>
            <p><strong>智能体名称：</strong>{selectedAgent.agentName}</p>
            <p><strong>智能体ID：</strong>{selectedAgent.agentID}</p>
            <p><strong>版本：</strong>{selectedAgent.agentVersion}</p>
            <p><strong>智能体类型：</strong>{selectedAgent.agentType}</p>
            <p><strong>更新时间：</strong>{new Date(selectedAgent.updateTime).toLocaleString()}</p>
            <p><strong>想定场景：</strong>{selectedAgent.scenarioID}</p>

            <h3>智能体分配信息</h3>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
                { title: '分配实体', dataIndex: 'assignedEntities', key: 'assignedEntities' },
              ]}
              dataSource={selectedAgent.entityAssignments.flatMap((assignment) =>
                Object.entries(assignment).map(([agentName, entities]) => ({
                  key: agentName,
                  agentName: agentName,
                  assignedEntities: entities.join(', '),
                }))
              )}
              pagination={false}
              bordered
            />

            <h3>实体状态信息</h3>
            <Table
              columns={[
                { title: '实体名称', dataIndex: 'name', key: 'name' },
                { title: '当前信号灯状态', dataIndex: 'trafficLightStatus', key: 'trafficLightStatus' },
                { title: '等待通过的车辆数量', dataIndex: 'waitingVehicles', key: 'waitingVehicles' },
                { title: '等待通过的行人数量', dataIndex: 'waitingPedestrians', key: 'waitingPedestrians' },
              ]}
              dataSource={selectedAgent.agentModel.flatMap((model) => {
                const entityStateMap = {};

                model.stateVector.forEach((state) => {
                  const entityName = state[0];
                  const fieldName = state[1];
                  const fieldValue = state[3];

                  if (!entityStateMap[entityName]) {
                    entityStateMap[entityName] = {
                      key: entityName,
                      name: entityName,
                      trafficLightStatus: '无',
                      waitingVehicles: '无',
                      waitingPedestrians: '无',
                    };
                  }

                  if (fieldName === 'Traffic Light Status') {
                    entityStateMap[entityName].trafficLightStatus = fieldValue;
                  } else if (fieldName === 'Number of Waiting Vehicles') {
                    entityStateMap[entityName].waitingVehicles = fieldValue;
                  } else if (fieldName === 'Number of Pedestrians') {
                    entityStateMap[entityName].waitingPedestrians = fieldValue;
                  }
                });

                return Object.values(entityStateMap);
              })}
              pagination={false}
              bordered
            />

            <h3>模型动作信息</h3>
            <Table
              columns={[
                { title: '实体名称', dataIndex: 'name', key: 'name' },
                { title: '动作名称', dataIndex: 'actionName', key: 'actionName' },
                { title: '动作类型', dataIndex: 'actionType', key: 'actionType' },
                { title: '动作值', dataIndex: 'actionValue', key: 'actionValue' },
                { title: '最大动作取值', dataIndex: 'maxActionValue', key: 'maxActionValue' },
                { title: '规则', dataIndex: 'rule', key: 'rule' },
              ]}
              dataSource={selectedAgent.agentModel.flatMap((model) => {
                const entities = [...new Set(model.stateVector.map((state) => state[0]))];
                return entities.map((entity) => {
                  const action = model.actionSpace.find((action) => action.entity === entity);
                  return {
                    key: entity,
                    name: entity,
                    actionName: action ? action.name : '无',
                    actionType: action ? action.type : '无',
                    actionValue: action ? (Array.isArray(action.action) ? action.action.join(', ') : '无') : '无',
                    maxActionValue: action ? (Array.isArray(action.action[1]) ? action.action[1].join(', ') : '无') : '无',
                    rule: action ? (Array.isArray(action.rule) ? action.rule.join(', ') : '无') : '无',
                  };
                });
              })}
              pagination={false}
              bordered
            />

            <h3>奖励信息</h3>
            <Table
              columns={[
                { title: '奖励名称', dataIndex: 'rewardName', key: 'rewardName' },
                { title: '奖励值', dataIndex: 'rewardValue', key: 'rewardValue' },
              ]}
              dataSource={(() => {
                const { rewards, teamReward } = selectedAgent.agentModel
                  .flatMap((model) => model.rewardFunction)
                  .reduce(
                    (acc, reward) => {
                      if (reward[1] === '团队奖励') {
                        acc.teamReward = reward;
                      } else {
                        acc.rewards.push({
                          key: acc.rewards.length,
                          rewardName: reward[1],
                          rewardValue: reward[0],
                        });
                      }
                      return acc;
                    },
                    { rewards: [], teamReward: null }
                  );

                return teamReward
                  ? rewards.concat({
                      key: 'team-reward',
                      rewardName: teamReward[1],
                      rewardValue: teamReward[0],
                    })
                  : rewards;
              })()}
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>

      {/* 模型列表弹窗 */}
      <Modal
        title="模型列表"
        open={isModelListModalVisible}
        onOk={() => setIsModelListModalVisible(false)}
        onCancel={() => setIsModelListModalVisible(false)}
        width={1000}
      >
        <Table
          columns={modelListColumns}
          dataSource={decisionModels}
          pagination={false}
          style={{ width: '100%' }}
          rowKey={'AGENT_MODEL_ID'}
        />
      </Modal>

      {/* 模型详情弹窗 */}
      <Modal
        title="模型详细信息"
        open={isModelInfoModalVisible}
        onOk={() => setIsModelInfoModalVisible(false)}
        onCancel={() => setIsModelInfoModalVisible(false)}
      >
        {currentModel && (
          <div>
            <p><strong>决策模型ID：</strong>{currentModel.AGENT_MODEL_ID}</p>
            <p><strong>智能体名称：</strong>{currentModel.AGENT_NAME}</p>
            <p><strong>场景名称：</strong>{currentModel.SCENARIO_NAME}</p>
            <p><strong>角色名称：</strong>{currentModel.ROLE_NAME}</p>
            <p><strong>模型版本：</strong>{currentModel.AGENT_MODEL_VERSION}</p>
            <p><strong>模型类型：</strong>{currentModel.NN_MODEL_TYPE}</p>
            <p><strong>创建时间：</strong>{currentModel.CREAT_TIME}</p>
            <p><strong>模型存放路径：</strong>{currentModel.MODEL_PATH}</p>
            <p><strong>模型效果图路径：</strong>{currentModel.IMG_URL}</p>
          </div>
        )}
      </Modal>

      {/* 训练状态弹窗 */}
      <Modal
        title="训练状态"
        open={isSuccessModalVisible}
        onOk={() => setIsSuccessModalVisible(false)}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
            确定
          </Button>,
        ]}
      >
        <p>训练完成！</p>
      </Modal>

      {/* 训练效果图片弹窗 */}
      <Modal
        title="训练效果图片"
        open={isEffectImageModalVisible}
        onOk={() => setIsEffectImageModalVisible(false)}
        onCancel={() => setIsEffectImageModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsEffectImageModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {effectImageUrl && <img src={effectImageUrl} alt="训练效果图片" style={{ width: '100%' }} />}
      </Modal>
    </div>
  );
});

export default Right;