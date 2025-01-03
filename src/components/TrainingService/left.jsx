import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message } from 'antd';
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
    setAlgorithmType(value); // 更新算法类型
    setAlgorithmsByType([]); // 重置根据算法类型筛选的算法列表
    intelligentStore.selectedAlgorithm = null; // 重置选定的算法
  
    // 根据算法类型筛选算法
    const filteredAlgorithms = algorithms.filter(algo => algo.type_name === value);
    setAlgorithmsByType(filteredAlgorithms);
  };

  const handleAlgorithmSelectChange = (value) => {
    const selectedAlgo = algorithms.find(algo => algo.name === value);
    intelligentStore.selectedAlgorithm = selectedAlgo;
  };

  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    intelligentStore.selectedScenario = selectedScene; // 更新选定的场景
    intelligentStore.selectedAgentRole = null; // 重置选定的智能体角色
  
    // 更新智能体角色列表
    const agentRoles = selectedScene.roles || [];
    setAgentRoles(agentRoles); // 更新智能体角色列表
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
          <><div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <h3>已载入智能体信息</h3>
              <p><strong>智能体名称：</strong>{intelligentStore.selectedAgent.agentName}</p>
              <p><strong>智能体ID：</strong>{intelligentStore.selectedAgent.agentID}</p>
              <p><strong>版本：</strong>{intelligentStore.selectedAgent.agentVersion}</p>
              <p><strong>智能体类型：</strong>{intelligentStore.selectedAgent.agentType}</p>
              <p><strong>更新时间：</strong>{new Date(intelligentStore.selectedAgent.updateTime).toLocaleString()}</p>
              <p><strong>想定场景：</strong>{intelligentStore.selectedAgent.scenarioID}</p>
              <h5>实体状态信息：</h5>
              <ul>
                {intelligentStore.selectedAgent.entities.map((entity, index) => (
                  <li key={index}>
                    <h6>{entity.name} : 当前信号灯状态：{entity.stateVector[0][2]}，等待通过的车辆数量：{entity.stateVector[1][2]}，等待通过的行人数量：{entity.stateVector[2][2]}</h6>
                  </li>
                ))}
              </ul>
              <h5>模型动作信息包括：</h5>
              <ul>
                {intelligentStore.selectedAgent.entities.map((entity, index) => (
                  <li key={index}>
                    <h6>动作：</h6>
                    {entity.actionSpace.map((actionSpace, actionIndex) => (
                      <span key={actionIndex}>
                        {actionSpace.action.join(',')}
                      </span>
                    ))}
                    <h6>规则：</h6>
                    {entity.actionSpace.map((actionSpace, actionIndex) => (
                      <span key={actionIndex}>
                        {actionSpace.rule.join(',')}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              <h5>奖励信息：</h5>
              <ul>
                {intelligentStore.selectedAgent.entities.map((entity, index) => (
                  <li key={index}>
                    {entity.rewardFunction.map(rf => (
                      <h6>{rf[1]}:{rf[0]}</h6>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          </>
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