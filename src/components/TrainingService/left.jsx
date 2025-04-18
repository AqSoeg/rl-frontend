import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message, Table } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import sidebarStore from '../AgentEditor/SidebarStore';

const { Option } = Select;

const Left = observer(({ scenarios, algorithms,datasets }) => {
  const [trainingMode, setTrainingMode] = useState('offline');
  const [visible, setVisible] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [agentRoles, setAgentRoles] = useState([]);
  



  // 使用 SidebarStore 中的状态初始化选定的想定场景和智能体角色
  const [selectedScenario, setSelectedScenario] = useState(sidebarStore.scenarioName);
  const [selectedAgentRole, setSelectedAgentRole] = useState(sidebarStore.roleName);

  // 监听 SidebarStore 中的状态变化
  useEffect(() => {
    const unsubscribe = sidebarStore.subscribe(() => {
      setSelectedScenario(sidebarStore.scenarioName);
      setSelectedAgentRole(sidebarStore.roleName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 初始化场景和智能体角色
  useEffect(() => {
    if (scenarios.length > 0 && selectedScenario) {
      const selectedScene = scenarios.find(scenario => scenario.name === selectedScenario);
      if (selectedScene) {
        intelligentStore.selectScenario(selectedScene);
        setAgentRoles(selectedScene.roles || []);
      }
    }
  }, [scenarios, selectedScenario]);

  // 初始化智能体角色
  useEffect(() => {
    if (agentRoles.length > 0 && selectedAgentRole) {
      const selectedRole = agentRoles.find(role => role.name === selectedAgentRole);
      if (selectedRole) {
        intelligentStore.selectAgentRole(selectedRole);
      }
    }
  }, [agentRoles, selectedAgentRole]);

  // 初始化算法类型和算法列表
  useEffect(() => {
    if (intelligentStore.algorithmType) {
      const filteredAlgorithms = algorithms.filter(algo => algo.type_name === intelligentStore.algorithmType);
      intelligentStore.setAlgorithmsByType(filteredAlgorithms);
    }
  }, [algorithms, intelligentStore.algorithmType]);

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
    intelligentStore.setAlgorithmType(value); // 更新全局状态
    const filteredAlgorithms = algorithms.filter(algo => algo.type_name === value);
    intelligentStore.setAlgorithmsByType(filteredAlgorithms); // 更新算法列表
  };

  const handleAlgorithmSelectChange = (value) => {
    const selectedAlgo = algorithms.find(algo => algo.name === value);
    intelligentStore.selectAlgorithm(selectedAlgo);
  };

  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    if (selectedScene) {
      intelligentStore.selectScenario(selectedScene);
      sidebarStore.setScenario(selectedScene.id, selectedScene.name);

      const agentRoles = selectedScene.roles || [];
      setAgentRoles(agentRoles);
      setSelectedAgentRole(''); // 重置智能体角色
    }
  };

  const handleAgentRoleSelectChange = (value) => {
    const selectedRole = agentRoles.find(role => role.name === value);
    if (selectedRole) {
      intelligentStore.selectAgentRole(selectedRole);
      sidebarStore.setRole(selectedRole.id, selectedRole.name);
    }
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
          value={selectedScenario} 
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
          value={selectedAgentRole}
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
        <Select
          value={intelligentStore.algorithmType} // 使用全局状态
          onChange={handleAlgorithmTypeChange}
          placeholder="请选择"
        >
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
          {intelligentStore.algorithmsByType.map((algo) => (
            <Option key={algo.name} value={algo.name}>
              {algo.name}
            </Option>
          ))}
          {!intelligentStore.algorithmsByType.length && <Option value="">请选择</Option>}
        </Select>
      </div>

      <div className='form-item'>
        {intelligentStore.selectedAgent ? (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
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

            <h5>智能体状态信息：</h5>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'name', key: 'name' },
                // 使用reduce来去除重复的列名
                ...intelligentStore.selectedAgent.agentModel
                  .flatMap((model) => model.stateVector.map((state) => state[2]))
                  .reduce((uniqueColumns, field) => {
                    if (!uniqueColumns.includes(field)) {
                      uniqueColumns.push(field);
                    }
                    return uniqueColumns;
                  }, [])
                  .map((field) => ({
                    title: field,
                    dataIndex: field,
                    key: field,
                  }))
              ]}
              dataSource={intelligentStore.selectedAgent.agentModel.map((model) => {
                // 初始化状态信息
                const entityState = {
                  key: model.name,
                  name: model.name,
                };

                // 遍历状态向量，更新状态信息，使用 state[2] 作为字段名
                model.stateVector.forEach((state) => {
                  const [, , fieldName, fieldValue] = state;
                  entityState[fieldName] = fieldValue;
                });

                return entityState;
              })}
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
        open={visible}
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
          {datasets.map((dataset) => (
            <Option key={dataset.OFFLINE_DATA_ID} value={dataset.DATASET_NAME}>
              {dataset.DATASET_NAME}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
});

export default Left;