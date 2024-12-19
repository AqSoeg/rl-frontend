import React, { useState, useEffect } from 'react';
import { Select, Button, Modal, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
const { Option } = Select;
import { observer } from 'mobx-react';

const Left =  observer(({ scenarios, algorithms, onAlgorithmSelect, onScenarioSelect }) => {
  const [trainingMode, setTrainingMode] = useState('offline');
  const [algorithmType, setAlgorithmType] = useState(''); // 设置默认算法类型
  const [algorithmsByType, setAlgorithmsByType] = useState([]); // 存储根据算法类型筛选的算法列表
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null); // 存储当前选中的算法
  const [visible, setVisible] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(null); // 新增：存储当前选中的场景
  const [selectedDataset, setSelectedDataset] = useState('');

  // 假设这是你的离线数据集列表
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
  useEffect(() => {
    // 这里可以添加任何副作用代码，比如日志输出或API请求
    console.log('Selected Agent Changed:', intelligentStore.selectedAgent);
  }, [intelligentStore.selectedAgent]);
  const handleTrainingModeChange = (value) => {
    setTrainingMode(value);
    setVisible(false); // 隐藏弹窗
  };

  const handleAlgorithmTypeChange = (value) => {
    setAlgorithmType(value);
    setSelectedAlgorithm(null); // 重置选中的算法
    const filteredAlgorithms = algorithms.filter(algo => algo.type_name === value);
    setAlgorithmsByType(filteredAlgorithms);
  };

  const handleAlgorithmSelectChange = (value) => {
    const selectedAlgo = algorithms.find(algo => algo.name === value);
    setSelectedAlgorithm(selectedAlgo);
    onAlgorithmSelect(selectedAlgo); // 将选中的算法传递给父组件
  };
  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    setSelectedScenario(selectedScene);
    onScenarioSelect(selectedScene); // 将选中的场景传递给父组件
  };
  const handleOk = async () => {
    try {
      if (!selectedDataset) {
        message.error('请选择一个数据集！');
        return;
      }

      // 这里可以发送请求到后端处理加载数据
      // await axios.post('/api/loadOfflineData', { datasetId: selectedDataset });

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
          value={selectedScenario ? selectedScenario.name : ''} 
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
          value={selectedAlgorithm ? selectedAlgorithm.name : ''}
          onChange={handleAlgorithmSelectChange}
          placeholder="请选择" // 设置默认提示为“请选择”
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
          <>
          <h3>已载入智能体信息</h3>
          <p><strong>智能体名称：</strong>{intelligentStore.selectedAgent.agentName}</p>
          <p><strong>智能体ID：</strong>{intelligentStore.selectedAgent.agentID}</p>
          <p><strong>版本：</strong>{intelligentStore.selectedAgent.agentVersion}</p>
          <p><strong>智能体类型：</strong>{intelligentStore.selectedAgent.agentType}</p>
          <p><strong>更新时间：</strong>{new Date(intelligentStore.selectedAgent.updateTime).toLocaleString()}</p>
          <p><strong>想定场景：</strong>{intelligentStore.selectedAgent.scenarioID}</p>
          </>
        ) : (
          <div>请选择一个智能体</div>
        )}
        <label>智能体数量</label>
        <Select placeholder="请选择">
          <Option value="1">1</Option>
          <Option value="2">2</Option>
          <Option value="3">3</Option>
          <Option value="4">4</Option>
          <Option value="5">5</Option>
        </Select>
        <label>智能体模型</label>
        <Select placeholder="请选择">
          <Option value="model1">模型1</Option>
          <Option value="model2">模型2</Option>
        </Select>
        <h5>模型输入（观测）信息包括：...</h5>
        <h5>模型输入（动作）信息包括：...</h5>
        <h5>奖励绑定信息：...</h5>
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