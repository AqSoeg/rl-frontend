import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message, Table } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';

const { Option } = Select;

const Left = observer(({ scenarios, algorithms }) => {
  const [trainingMode, setTrainingMode] = useState('offline');
  const [algorithmType, setAlgorithmType] = useState('');
  const [algorithmsByType, setAlgorithmsByType] = useState([]);
  const [visible, setVisible] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [agentRoles, setAgentRoles] = useState([]);

  const offlineDatasets = [
    { id: 1, name: 'Dataset 1' },
    { id: 2, name: 'Dataset 2' },
    { id: 3, name: 'Dataset 3' },
  ];

  const showDataLoadModal = () => {
    setVisible(true);
  };

  const handleDatasetChange = (value) => {
    setSelectedDataset(value);
  };

  const handleTrainingModeChange = (value) => {
    setTrainingMode(value);
    setVisible(false);
  };

  const handleAlgorithmTypeChange = (value) => {
    setAlgorithmType(value);
    setAlgorithmsByType([]);
    intelligentStore.selectedAlgorithm = null;

    const filteredAlgorithms = algorithms.filter(algo => algo.type_name === value);
    setAlgorithmsByType(filteredAlgorithms);
  };

  const handleAlgorithmSelectChange = (value) => {
    const selectedAlgo = algorithms.find(algo => algo.name === value);
    intelligentStore.selectedAlgorithm = selectedAlgo;
  };

  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    intelligentStore.selectedScenario = selectedScene;
    intelligentStore.selectedAgentRole = null;

    const agentRoles = selectedScene.roles || [];
    setAgentRoles(agentRoles);
  };

  const handleAgentRoleSelectChange = (value) => {
    const selectedRole = agentRoles.find(role => role.name === value);
    intelligentStore.selectedAgentRole = selectedRole;
  };

  const handleOk = async () => {
    try {
      if (!selectedDataset) {
        message.error('请选择一个数据集！');
        return;
      }
      message.success('数据集加载成功！');
      setVisible(false);
    } catch (error) {
      console.error("There was an error loading the dataset!", error);
      message.error('发生错误，请检查网络连接或稍后再试。');
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const uniqueAlgorithmTypeNames = Array.from(new Set(algorithms.map(algo => algo.type_name)));

  return (
    <div className='left'>
      <div className="form-item">
        <label>想定场景</label>
        <Select 
          value={intelligentStore.selectedScenario ? intelligentStore.selectedScenario.name : ''} 
          onChange={handleScenarioSelectChange}
          placeholder="请选择"
        >
          {scenarios.map((scenario, index) => (
            <Option key={scenario.name} value={scenario.name}>
              {scenario.name}
            </Option>
          ))}
        </Select>
      </div>
      <div className="form-item">
        <label>智能体角色</label>
        <Select
          value={intelligentStore.selectedAgentRole ? intelligentStore.selectedAgentRole.name : ''}
          onChange={handleAgentRoleSelectChange}
          placeholder="请选择"
        >
          {agentRoles.map((role, index) => (
            <Option key={role.name} value={role.name}>
              {role.name}
            </Option>
          ))}
        </Select>
      </div>
      <div className="form-item">
        <label>训练方式</label>
        <Select value={trainingMode} onChange={handleTrainingModeChange}>
          <Option value="offline">离线数据</Option>
          <Option value="online">在线交互</Option>
        </Select>
        {trainingMode === 'offline' && (
          <Button type="default" onClick={showDataLoadModal}>
            离线数据载入
          </Button>
        )}
      </div>
      <div className="form-item">
        <label>算法类型</label>
        <Select value={algorithmType} onChange={handleAlgorithmTypeChange}>
          {uniqueAlgorithmTypeNames.map((typeName) => (
            <Option key={typeName} value={typeName}>
              {typeName}
            </Option>
          ))}
        </Select>
      </div>
      <div className="form-item">
        <label>算法选择</label>
        <Select
          value={intelligentStore.selectedAlgorithm ? intelligentStore.selectedAlgorithm.name : ''}
          onChange={handleAlgorithmSelectChange}
          placeholder="请选择"
        >
          {algorithmsByType.map((algo) => (
            <Option key={algo.name} value={algo.name}>
              {algo.name}
            </Option>
          ))}
          {!algorithmsByType.length && <Option value="">请选择</Option>}
        </Select>
      </div>

      <div className='form-item'>
        {intelligentStore.selectedAgent ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <h3>已载入智能体信息</h3>
            <p><strong>智能体名称：</strong>{intelligentStore.selectedAgent.agentName}</p>
            <p><strong>智能体ID：</strong>{intelligentStore.selectedAgent.agentID}</p>
            <p><strong>版本：</strong>{intelligentStore.selectedAgent.agentVersion}</p>
            <p><strong>智能体类型：</strong>{intelligentStore.selectedAgent.agentType}</p>
            <p><strong>更新时间：</strong>{new Date(intelligentStore.selectedAgent.updateTime).toLocaleString()}</p>
            <p><strong>想定场景：</strong>{intelligentStore.selectedAgent.scenarioID}</p>

            {/* 智能体分配信息 */}
            <h5>智能体分配信息：</h5>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
                { title: '分配实体', dataIndex: 'assignedEntities', key: 'assignedEntities' },
              ]}
              dataSource={intelligentStore.selectedAgent.entityAssignments.flatMap((assignment) =>
                Object.entries(assignment).map(([agentName, entities]) => ({
                  key: agentName,
                  agentName: agentName,
                  assignedEntities: entities.join(', '),
                }))
              )}
              pagination={false}
              bordered
            />

            {/* 智能体状态信息 */}
            <h5>智能体状态信息：</h5>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'name', key: 'name' },
                { title: '当前信号灯状态', dataIndex: 'trafficLightStatus', key: 'trafficLightStatus' },
                { title: '等待通过的车辆数量', dataIndex: 'waitingVehicles', key: 'waitingVehicles' },
                { title: '等待通过的行人数量', dataIndex: 'waitingPedestrians', key: 'waitingPedestrians' },
              ]}
              dataSource={intelligentStore.selectedAgent.agentModel.map((model) => ({
                key: model.name,
                name: model.name,
                trafficLightStatus: model.stateVector.find((state) => state[1] === 'Traffic Light Status')?.[3] || '无',
                waitingVehicles: model.stateVector.find((state) => state[1] === 'Number of Waiting Vehicles')?.[3] || '无',
                waitingPedestrians: model.stateVector.find((state) => state[1] === 'Number of Pedestrians')?.[3] || '无',
              }))}
              pagination={false}
              bordered
            />

            {/* 智能体动作信息 */}
            <h5>智能体动作信息：</h5>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'name', key: 'name' },
                { title: '动作名称', dataIndex: 'actionName', key: 'actionName' },
                { title: '动作类型', dataIndex: 'actionType', key: 'actionType' },
                { title: '动作值', dataIndex: 'actionValue', key: 'actionValue' },
                { title: '最大动作取值', dataIndex: 'maxActionValue', key: 'maxActionValue' },
                { title: '规则', dataIndex: 'rule', key: 'rule' },
              ]}
              dataSource={intelligentStore.selectedAgent.agentModel.map((model) => {
                const action = model.actionSpace[0]; // 假设每个智能体只有一个动作
                return {
                  key: model.name,
                  name: model.name,
                  actionName: action ? action.name : '无',
                  actionType: action ? action.type : '无',
                  actionValue: action ? (Array.isArray(action.action) ? action.action.join(', ') : '无') : '无',
                  maxActionValue: action ? (Array.isArray(action.action[1]) ? action.action[1].join(', ') : '无') : '无',
                  rule: action ? (Array.isArray(action.rule) ? action.rule.join(', ') : '无') : '无',
                };
              })}
              pagination={false}
              bordered
            />

            {/* 智能体奖励信息 */}
            <h5>智能体奖励信息：</h5>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'name', key: 'name' },
                { title: '奖励名称', dataIndex: 'rewardName', key: 'rewardName' },
                { title: '奖励值', dataIndex: 'rewardValue', key: 'rewardValue' },
              ]}
              dataSource={intelligentStore.selectedAgent.agentModel.map((model) => {
                const rewards = model.rewardFunction.reduce((acc, reward) => {
                  if (reward[1] === '团队奖励') {
                    if (!acc.some((r) => r[1] === '团队奖励')) {
                      acc.push(reward);
                    }
                  } else {
                    acc.push(reward);
                  }
                  return acc;
                }, []);
                return rewards.map((reward, index) => ({
                  key: `${model.name}-${index}`,
                  name: model.name,
                  rewardName: reward[1],
                  rewardValue: reward[0],
                }));
              }).flat()}
              pagination={false}
              bordered
            />
          </div>
        ) : (
          <div>请选择一个智能体</div>
        )}
      </div>

      <Modal
        title="载入离线数据"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="OK"
        cancelText="Cancel"
      >
        <Select
          placeholder="请选择数据集"
          value={selectedDataset}
          onChange={handleDatasetChange}
          style={{ width: '100%' }}
        >
          {offlineDatasets.map((dataset) => (
            <Option key={dataset.id} value={dataset.name}>
              {dataset.name}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
});

export default Left;