import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Space, Button, Modal, Table, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
import axios from 'axios';
import { observer } from 'mobx-react';

const { Option } = Select;

const Right = observer(({ algorithms }) => {
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isModelListModalVisible, setIsModelListModalVisible] = useState(false);
  const [isModelInfoModalVisible, setIsModelInfoModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [training, setTraining] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [hyperParametersValues, setHyperParametersValues] = useState({});
  const [effectImageUrl, setEffectImageUrl] = useState(null); // 存储图片 URL
const [isEffectImageModalVisible, setIsEffectImageModalVisible] = useState(false); // 控制弹窗显示
  useEffect(() => {
    if (intelligentStore.selectedScenario && intelligentStore.selectedAgentRole) {
      fetchAgents();
    }
  }, [intelligentStore.selectedScenario, intelligentStore.selectedAgentRole]);
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
    if (intelligentStore.selectedScenario) {
      fetchAgents();
    }
  }, [intelligentStore.selectedScenario]);

  useEffect(() => {
    if (intelligentStore.selectedAgentRole) {
      fetchAgents();
    }
  }, [intelligentStore.selectedAgentRole]);

  const fetchAgents = async () => {
    try {
      const modelResponse = await axios.get('tmp/model.json');
      const models = modelResponse.data;
      const urls = models.map(model => `http://localhost:3002/${model.id || models.indexOf(model)}`);
      const responses = await Promise.all(urls.map(url => axios.get(url)));
      let allData = [];
      for (let response of responses) {
        allData = allData.concat(response.data);
      }    const filteredAgents = allData.filter(agent => 
        agent.scenarioID === intelligentStore.selectedScenario.id &&
        agent.agentRoleID === intelligentStore.selectedAgentRole.id
      );
  
      setAgents(filteredAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const modelList = [
    { scenarioID: '1', agentRoleID: '2', agentName: '3', decisionModelID: '4', agentType: '5' }
  ];

  const scenarioColumns = [
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', render: time => new Date(time).toLocaleString() },
    { title: '代理实体', dataIndex: 'entities', key: 'entities', render: (text, record) => record.entities.map(entity => entity.name).join(', ') || '无' },
    {
      title: '操作', key: 'action', render: (text, record) => (
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
    {
      title: '操作', key: 'action', render: (text, record) => (
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

  const trainAlgorithm = async () => {
    setTraining(true);
    try {
      const response = await fetch('http://localhost:5000/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hyperParametersValues })
      });
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log(data);
  
      if (data.status === 'success') {
        setIsSuccessModalVisible(true);
      } else {
        message.error('训练失败，请检查日志');
      }
    } catch (error) {
      console.error('训练过程中发生错误:', error);
      message.error('训练失败，请检查日志');
    } finally {
      setTraining(false);
    }
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
      // 发送请求到后端获取图片
      const response = await axios.get(`http://localhost:5000/get-effect-image`, {
        responseType: 'blob', // 指定响应类型为二进制数据
      });
  
      // 将二进制数据转换为图片 URL
      const imageUrl = URL.createObjectURL(new Blob([response.data]));
  
      // 显示图片
      setEffectImageUrl(imageUrl);
      setIsEffectImageModalVisible(true); // 显示图片弹窗
    } catch (error) {
      console.error('获取效果图片失败:', error);
      message.error('获取效果图片失败，请检查网络或联系管理员');
    }
  };

  const handlePublishModel = async (record) => {
    try {
      // 发送请求到后端，发布模型
      const response = await axios.post('http://localhost:5000/publish-model', {
        decisionModelID: record.decisionModelID,
        modelInfo: {
          scenarioID: record.scenarioID,
          agentRoleID: record.agentRoleID,
          agentName: record.agentName,
          agentType: record.agentType,
        },
      });
  
      // 处理后端响应
      if (response.data && response.data.status === 'success') {
        message.success('模型发布成功！');
      } else {
        message.error('模型发布失败，请检查日志');
      }
    } catch (error) {
      console.error('模型发布失败:', error);
      message.error('模型发布失败，请检查网络或联系管理员');
    }
  };

  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalVisible(true);
  };

  const handleOk = () => {
    setIsDetailModalVisible(false);
  };

  const handleCancel = () => {
    setIsDetailModalVisible(false);
  };

  const handleLoad = (agent) => {
    intelligentStore.loadAgent(agent);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {intelligentStore.selectedScenario && intelligentStore.selectedAgentRole && (
        <Card title="已选想定场景、智能体角色的智能体设计列表" bordered={true} style={{ marginBottom: 16 }}>
          <Table
            columns={scenarioColumns}
            dataSource={agents}
            pagination={{ pageSize: 2, showQuickJumper: true }}
            bordered
          />
        </Card>
      )}

      {intelligentStore.selectedAlgorithm && intelligentStore.selectedAlgorithm['hyper-parameters'] && (
        <Card title="训练超参数" bordered={true} style={{ marginBottom: 16 }}>
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
        <Button>训练终止</Button>
      </div>

      <Modal
        title="智能体详情"
        visible={isDetailModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <div>
          {selectedAgent && (
            <div>
              <p><strong>智能体名称：</strong>{selectedAgent.agentName}</p>
              <p><strong>智能体ID：</strong>{selectedAgent.agentID}</p>
              <p><strong>版本：</strong>{selectedAgent.agentVersion}</p>
              <p><strong>智能体类型：</strong>{selectedAgent.agentType}</p>
              <p><strong>更新时间：</strong>{new Date(selectedAgent.updateTime).toLocaleString()}</p>
              <p><strong>想定场景：</strong>{selectedAgent.scenarioID}</p>
              <h3>状态信息</h3>
              {selectedAgent.entities.map((entity, index) => (
                <div key={index}>
                  <p><strong>实体名称：</strong>{entity.name}</p>
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid black', padding: '5px' }}>属性</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>描述</th>
                        <th style={{ border: '1px solid black', padding: '5px' }}>单位</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.stateVector.map((state, stateIndex) => (
                        <tr key={stateIndex}>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{state[0]}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{state[1]}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{state[2]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <h3>动作信息</h3>
              {selectedAgent.entities.map((entity, index) => (
                <div key={index}>
                  <p><strong>实体名称：</strong>{entity.name}</p>
                  <p><strong>动作：</strong>{entity.actionSpace ? entity.actionSpace.map(action => action.action.join(' ')).join(', ') : '无'}</p>
                  <p><strong>规则：</strong>{entity.actionSpace ? entity.actionSpace.map(action => action.rule.join(' ')).join(', ') : '无'}</p>
                </div>
              ))}
              <h3>奖励信息</h3>
              {selectedAgent.entities.map((entity, index) => (
                <div key={index}>
                  <p><strong>实体名称：</strong>{entity.name}</p>
                  <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>奖励类型</th>
                        <th style={{ border: '1px solid black', padding: '5px', fontWeight: 'bold' }}>奖励函数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.rewardFunction.map((reward, rewardIndex) => (
                        <tr key={rewardIndex}>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{reward[1]}</td>
                          <td style={{ border: '1px solid black', padding: '5px' }}>{reward[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
      <Modal
        title="模型列表"
        visible={isModelListModalVisible}
        onOk={() => setIsModelListModalVisible(false)}
        onCancel={() => setIsModelListModalVisible(false)}
      >
        <Table
          columns={modelListColumns}
          dataSource={modelList}
          pagination={false}
        />
      </Modal>
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
            <Table
              columns={modelInfoColumns}
              dataSource={[currentModel]}
              pagination={false}
            />
          </div>
        )}
      </Modal>
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