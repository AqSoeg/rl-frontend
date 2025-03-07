import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Space, Button, Modal, Table, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import axios from 'axios';

const { Option } = Select;

const Right = observer(() => {
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
      const response = await axios.get('tmp/model.json');
      const models = response.data;

      // 根据 scenarioID 和 agentRoleID 过滤智能体
      const filteredAgents = models.filter(agent =>
        agent.scenarioID === intelligentStore.selectedScenario.id &&
        agent.agentRoleID === intelligentStore.selectedAgentRole.id
      );

      setAgents(filteredAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
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

  const [trainingStatus, setTrainingStatus] = useState("idle"); // 训练状态：idle、running、completed

 // 开始训练
  const trainAlgorithm = async () => {
    if (!intelligentStore.selectedAgent) {
      message.error('请先载入智能体！');
      return;
    }

    setTraining(true);
    try {
      // 构建请求体
      const requestBody = {
        agentInfo: {
          agentID: intelligentStore.selectedAgent.agentID,
          agentName: intelligentStore.selectedAgent.agentName,
          agentType: intelligentStore.selectedAgent.agentType,
          scenarioID: intelligentStore.selectedAgent.scenarioID,
          agentRoleID: intelligentStore.selectedAgent.agentRoleID,
        },
        algorithmInfo: {
          algorithmType: intelligentStore.selectedAlgorithm.type,
          algorithmName: intelligentStore.selectedAlgorithm.name,
          hyperParameters: hyperParametersValues,
        },
        scenarioEditInfo: {
          // 从intelligence对象中提取场景编辑信息
          scenarioName: intelligentStore.selectedScenario.name,
          entities: intelligentStore.selectedAgentRole.id
        },
      };

      const response = await fetch('http://localhost:5000/train', {
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
        setTrainingStatus("running");

        // 轮询训练状态
        const checkTrainingStatus = async () => {
          const statusResponse = await fetch('http://localhost:5000/training_status');
          const statusData = await statusResponse.json();
          if (statusData.status === "completed") {
            setTrainingStatus("completed");
            setTraining(false);

            // 处理训练结果
            if (statusData.result.status === "success") {
              message.success('训练完成，模型已保存！');
              // 保存模型到 modelList
              const trainedModel = {
                scenarioID: intelligentStore.selectedAgent.scenarioID,
                agentRoleID: intelligentStore.selectedAgent.agentRoleID,
                agentName: intelligentStore.selectedAgent.agentName,
                decisionModelID: Date.now(),
                agentType: intelligentStore.selectedAgent.agentType,
                algorithmType: intelligentStore.selectedAlgorithm.type,
                algorithmName: intelligentStore.selectedAlgorithm.name,
              };
              setModelList((prevModelList) => [...prevModelList, trainedModel]);
            } else if (statusData.result.status === "stopped") {
              message.warning('训练已终止，模型未保存');
            } else {
              message.error('训练失败，请检查日志');
            }
          } else {
            // 继续轮询
            setTimeout(checkTrainingStatus, 1000);
          }
        };

        checkTrainingStatus(); // 开始轮询
      } else {
        message.error('训练失败，请检查日志');
      }
    } catch (error) {
      console.error('训练过程中发生错误:', error);
      message.error('训练失败，请检查日志');
    }
  };
  
  // 终止训练
  const stopTraining = async () => {
    try {
      const response = await fetch('http://localhost:5000/stop_training', {
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
        message.success('训练终止请求已发送');
      } else {
        message.error('训练终止失败，请检查日志');
      }
    } catch (error) {
      console.error('训练终止失败:', error);
      message.error('训练终止失败，请检查网络或联系管理员');
    }
  };
  // 查看智能体详情
  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalVisible(true);
  };

  // 载入智能体
  const handleLoad = (agent) => {
    intelligentStore.loadAgent(agent); // 将选中的智能体信息存储到 IntelligentStore
    message.success('智能体载入成功！'); // 提示用户
  };

  // 查看模型列表
  const handleViewModelListClick = () => {
    setIsModelListModalVisible(true);
  };

  // 查看模型详情
  const handleViewModel = (model) => {
    setCurrentModel(model);
    setIsModelInfoModalVisible(true);
  };

  // 查看模型效果
  const handleEffectModel = async (record) => {
    try {
      const response = await fetch('http://localhost:5000/get_effect', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const blob = await response.blob(); // 获取 Blob 数据
      const imageUrl = URL.createObjectURL(blob); // 生成图片 URL
      setEffectImageUrl(imageUrl);
      setIsEffectImageModalVisible(true);
    } catch (error) {
      console.error('获取效果图片失败:', error);
      message.error('获取效果图片失败，请检查网络或联系管理员');
    }
  };

  // 发布模型
  const handlePublishModel = async (record) => {
    try {
      const response = await fetch('http://localhost:5000/publish_model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisionModelID: record.decisionModelID,
          modelInfo: {
            scenarioID: record.scenarioID,
            agentRoleID: record.agentRoleID,
            agentName: record.agentName,
            agentType: record.agentType,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const data = await response.json(); // 解析响应数据
      if (data.status === 'success') {
        message.success('模型发布成功！');
      } else {
        message.error('模型发布失败，请检查日志');
      }
    } catch (error) {
      console.error('模型发布失败:', error);
      message.error('模型发布失败，请检查网络或联系管理员');
    }
  };

  // 表格列定义
  const scenarioColumns = [
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
        // 提取 entityAssignments 中的智能体和实体名称
        const assignments = record.entityAssignments.map((assignment, index) => {
          const agentName = Object.keys(assignment)[0]; // 获取智能体名称
          const entities = assignment[agentName].join(', '); // 获取实体名称并拼接成字符串
          return `${agentName}: ${entities}`; // 返回智能体和实体名称的组合
        });

        // 使用 <br /> 标签实现换行
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
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '决策模型ID', dataIndex: 'decisionModelID', key: 'decisionModelID' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '算法类型', dataIndex: 'algorithmType', key: 'algorithmType' }, // 新增列：算法类型
    { title: '算法名称', dataIndex: 'algorithmName', key: 'algorithmName' }, // 新增列：算法名称
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleViewModel(record)}>查看</Button>
          <Button type="primary" onClick={() => handleEffectModel(record)}>效果</Button>
          <Button type="primary" onClick={() => handlePublishModel(record)}>发布</Button>
        </div>
      ),
    },
  ];

  const modelInfoColumns = [
    { title: '输入情况', dataIndex: 'inputInfo', key: 'inputInfo' },
    { title: '输出情况', dataIndex: 'outputInfo', key: 'outputInfo' },
  ];

  return (
    <div className='right1' style={{height : '80vh'}}>
      {intelligentStore.selectedScenario && intelligentStore.selectedAgentRole && (
        <Card title="已选想定场景、智能体角色的智能体设计列表" bordered={true} >
          <Table
            columns={scenarioColumns}
            dataSource={agents}
            pagination={{ pageSize: 4, showQuickJumper: true }}
            bordered
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
        visible={isDetailModalVisible}
        onOk={() => setIsDetailModalVisible(false)}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800} // 可以根据需要调整弹窗宽度
      >
        {selectedAgent && (
          <div>
            {/* 智能体基本信息 */}
            <p><strong>智能体名称：</strong>{selectedAgent.agentName}</p>
            <p><strong>智能体ID：</strong>{selectedAgent.agentID}</p>
            <p><strong>版本：</strong>{selectedAgent.agentVersion}</p>
            <p><strong>智能体类型：</strong>{selectedAgent.agentType}</p>
            <p><strong>更新时间：</strong>{new Date(selectedAgent.updateTime).toLocaleString()}</p>
            <p><strong>想定场景：</strong>{selectedAgent.scenarioID}</p>

            {/* 智能体分配信息表格 */}
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
                // 创建一个对象，用于存储每个实体的状态信息
                const entityStateMap = {};

                model.stateVector.forEach((state) => {
                  const entityName = state[0]; // 实体名称
                  const fieldName = state[1];  // 字段名称
                  const fieldValue = state[3]; // 字段值

                  // 初始化实体状态对象
                  if (!entityStateMap[entityName]) {
                    entityStateMap[entityName] = {
                      key: entityName,
                      name: entityName,
                      trafficLightStatus: '无', // 默认值
                      waitingVehicles: '无',    // 默认值
                      waitingPedestrians: '无', // 默认值
                    };
                  }

                  // 根据字段名称填充数据
                  if (fieldName === 'Traffic Light Status') {
                    entityStateMap[entityName].trafficLightStatus = fieldValue;
                  } else if (fieldName === 'Number of Waiting Vehicles') {
                    entityStateMap[entityName].waitingVehicles = fieldValue;
                  } else if (fieldName === 'Number of Pedestrians') {
                    entityStateMap[entityName].waitingPedestrians = fieldValue;
                  }
                });

                // 将对象转换为数组
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
                // 获取所有实体的动作信息，并去重
                const entities = [...new Set(model.stateVector.map((state) => state[0]))]; // 去重后的实体名称
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
              dataSource={
                (() => {
                  // 提取奖励信息
                  const { rewards, teamReward } = selectedAgent.agentModel
                    .flatMap((model) => model.rewardFunction) // 将所有智能体的奖励信息合并
                    .reduce(
                      (acc, reward) => {
                        // 如果是团队奖励，记录下来
                        if (reward[1] === '团队奖励') {
                          acc.teamReward = reward; // 记录团队奖励信息
                        } else {
                          // 其他奖励直接添加到表格数据中
                          acc.rewards.push({
                            key: acc.rewards.length, // 生成唯一的 key
                            rewardName: reward[1], // 奖励名称
                            rewardValue: reward[0], // 奖励值
                          });
                        }
                        return acc;
                      },
                      { rewards: [], teamReward: null } // 初始化 acc
                    );

                  // 将团队奖励信息添加到表格的最后一行
                  return teamReward
                    ? rewards.concat({
                        key: 'team-reward', // 唯一的 key
                        rewardName: teamReward[1], // 奖励名称
                        rewardValue: teamReward[0], // 奖励值
                      })
                    : rewards;
                })()
              }
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>

      {/* 模型列表弹窗 */}
      <Modal
        title="模型列表"
        visible={isModelListModalVisible}
        onOk={() => setIsModelListModalVisible(false)}
        onCancel={() => setIsModelListModalVisible(false)}
        width={1000} 
      >
        <Table
          columns={modelListColumns}
          dataSource={modelList} // 使用 modelList 数据作为模型列表
          pagination={false}
          style={{ width: '100%' }} 
        />
      </Modal>

      {/* 模型详情弹窗 */}
      <Modal
        title="模型详细信息"
        visible={isModelInfoModalVisible}
        onOk={() => setIsModelInfoModalVisible(false)}
        onCancel={() => setIsModelInfoModalVisible(false)}
      >
        {currentModel && (
          <div>
            <p><strong>想定场景：</strong>{currentModel.scenarioID}</p>
            <p><strong>智能体角色：</strong>{currentModel.agentRoleID}</p>
            <p><strong>决策模型ID：</strong>{currentModel.decisionModelID}</p>
            <p><strong>智能体名称：</strong>{currentModel.agentName}</p>
            <p><strong>智能体类型：</strong>{currentModel.agentType}</p>
            <p><strong>算法类型：</strong>{currentModel.algorithmType}</p>
            <p><strong>算法名称：</strong>{currentModel.algorithmName}</p>
            <Table
              columns={modelInfoColumns}
              dataSource={[currentModel]}
              pagination={false}
            />
          </div>
        )}
      </Modal>

      {/* 训练状态弹窗 */}
      <Modal
        title="训练状态"
        visible={isSuccessModalVisible}
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
        visible={isEffectImageModalVisible}
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