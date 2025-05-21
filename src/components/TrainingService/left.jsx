import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message, Table } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import sidebarStore from '../AgentEditor/SidebarStore';

const { Option } = Select;

const Left = observer(({ scenarios, algorithms, datasets }) => {
  const [trainingMode, setTrainingMode] = useState('online'); // 默认选择在线交互
  const [visible, setVisible] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null); // 本地状态跟踪选中的数据集
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

  // 根据训练模式过滤算法类型
  const getFilteredAlgorithmTypes = () => {
    if (trainingMode === 'offline') {
      return ['单智能体']; // 离线模式下只返回单智能体
    }
    
    const uniqueTypes = new Set();
    algorithms.forEach(algo => {
      if (algo.train_mode === 'online') {
        uniqueTypes.add(algo.type_name);
      }
    });
    return Array.from(uniqueTypes);
  };

  // 根据算法类型和训练模式过滤算法
  const getFilteredAlgorithms = (typeName) => {
    return algorithms.filter(algo => 
      algo.type_name === typeName && 
      algo.train_mode === trainingMode
    );
  };

  const showDataLoadModal = () => {
    if (trainingMode !== 'offline') {
      message.warning('请先选择离线训练模式！');
      return;
    }
    setVisible(true);
  };

  const handleLoadDataset = async (record) => {
    try {
      const response = await fetch(__APP_CONFIG__.load_dataset, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dataset: record }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const result = await response.json();
      if (result.success) {
        message.success(`数据集加载成功！`);
        const dataset = result.dataset.dataset;
        console.log(dataset)
        setSelectedDataset(dataset); // 更新本地状态
        intelligentStore.setSelectedDataset(dataset); // 保存到 store
        setVisible(false);
      } else {
        message.error(result.message || '数据集加载失败');
      }
    } catch (error) {
      console.error("加载数据集失败:", error);
      message.error('加载数据集失败，请稍后再试');
    } 
  };

const handleTrainingModeChange = (value) => {
  setTrainingMode(value);
  intelligentStore.setTrainingMode(value);
  // 重置算法选择
  intelligentStore.setAlgorithmType('');
  intelligentStore.setAlgorithmsByType([]);
  intelligentStore.selectAlgorithm(null);

  // 仅在从 offline 切换到 online 时清空数据集
  if (value === 'online') {
    setSelectedDataset(null);
    intelligentStore.setSelectedDataset(null);
  }
};

  const handleAlgorithmTypeChange = (value) => {
    intelligentStore.setAlgorithmType(value);
    const filteredAlgorithms = getFilteredAlgorithms(value);
    intelligentStore.setAlgorithmsByType(filteredAlgorithms);
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

  const handleOk = () => {
    if (!selectedDataset) {
      message.error('请选择一个数据集！');
      return;
    }
    message.success('数据集选择确认！');
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const datasetColumns = [
    {
      title: '数据集ID',
      dataIndex: 'OFFLINE_DATA_ID',
      key: 'OFFLINE_DATA_ID',
    },
    {
      title: '数据集名称',
      dataIndex: 'DATASET_NAME',
      key: 'DATASET_NAME',
    },
    {
      title: '场景名称',
      dataIndex: 'SCENARIO_NAME',
      key: 'SCENARIO_NAME',
    },
    {
      title: '角色名称',
      dataIndex: 'AGENT_ROLE',
      key: 'AGENT_ROLE',
    },
    {
      title: '状态描述',
      dataIndex: 'DATA_STATE',
      key: 'DATA_STATE',
    },
    {
      title: '动作描述',
      dataIndex: 'DATA_ACTION',
      key: 'DATA_ACTION',
    },
    {
      title: '创建时间',
      dataIndex: 'CREAT_TIME',
      key: 'CREAT_TIME',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          onClick={() => handleLoadDataset(record)}
        >
          载入
        </Button>
      ),
    },
  ];
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
          <Option value="online">在线交互</Option>
          <Option value="offline">离线数据</Option>
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
          value={intelligentStore.algorithmType}
          onChange={handleAlgorithmTypeChange}
          placeholder="请选择"
        >
          {getFilteredAlgorithmTypes().map((typeName) => (
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
        width={1000}
      >
        <Table
          columns={datasetColumns}
          dataSource={datasets}
          rowKey="OFFLINE_DATA_ID"
        />
      </Modal>
    </div>
  );
});

export default Left;