import React, { useState } from 'react';
import { Select, Button, Modal } from 'antd';

const { Option } = Select;

const Left = () => {
  const [trainingMode, setTrainingMode] = useState('offline');
  const [algorithmType, setAlgorithmType] = useState('shared');
  const [visible, setVisible] = useState(false);

  const showDataLoadModal = () => {
    setVisible(true);
  };

  const handleTrainingModeChange = (value) => {
    setTrainingMode(value);
    setVisible(false); // 隐藏弹窗
  };

  const handleAlgorithmTypeChange = (value) => {
    setAlgorithmType(value);
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
      <div className='left'>
        <div className="form-item">
          <label>想定场景</label>
          <Select placeholder="请选择">
            <Option value="scenario1">场景1</Option>
            <Option value="scenario2">场景2</Option>
            <Option value="scenario3">场景3</Option>
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
          <label>算法选择</label>
          <Select value={algorithmType} onChange={handleAlgorithmTypeChange}>
            <Option value="shared">共享式多智能体</Option>
            <Option value="independent">分布式多智能体</Option>
            <Option value="single">单智能体</Option>
          </Select>
          {algorithmType === 'shared' && (
            <Select placeholder="请选择">
              <Option value="MAPPO">MAPPO</Option>
            </Select>
          )}
          {algorithmType === 'independent' && (
            <Select placeholder="请选择">
              <Option value="MADDPG">MADDPG</Option>
            </Select>
          )}
          {algorithmType === 'single' && (
            <Select placeholder="请选择">
              <Option value="PPO">PPO</Option>
              <Option value="DDPG">DDPG</Option>
            </Select>
          )}
        </div>

        {/* 弹窗界面 */}
        <Modal
          title="载入离线数据"
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {/* 弹窗内容 */}
        </Modal>

        <div className="form-item">
          <h5>智能体名称：XXX</h5>
          <h5>智能体ID：XXX</h5>
          <h5>智能体版本：XXX</h5>
          <h5>模型类型：XXX</h5>
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
      </div>
  );
};

export default Left;