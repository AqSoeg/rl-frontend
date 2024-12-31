// right.jsx
import React, { useState,useEffect } from 'react';
import { Card, Select, Row, Col, Space ,Button, Modal ,Table, message} from 'antd';
import {  SettingOutlined } from '@ant-design/icons';
import { intelligentStore } from './IntelligentStore';
import axios from 'axios';
const { Option } = Select;

const Right = ({ selectedAlgorithm,selectedScenario, selectedAgentRole}) => { // 接收 scenarios 作为 props
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [isModelListModalVisible, setIsModelListModalVisible] = useState(false);
  const [isModelInfoModalVisible, setIsModelInfoModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [training, setTraining] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (selectedAlgorithm && selectedAlgorithm['hyper-parameters']) {
      const initialParams = selectedAlgorithm['hyper-parameters'].reduce((acc, param) => {
        acc[param.id] = param.default;
        return acc;
      }, {});
      setHyperParametersValues(initialParams);
    }
  }, [selectedAlgorithm]);
  useEffect(() => {
    // 当 selectedScenario 改变时，重新获取相关智能体信息
    if (selectedScenario) {
      fetchAgents();
    }
  }, [selectedScenario]);
  useEffect(() => {
    // 当 selectedScenario 改变时，重新获取相关智能体信息
    if (selectedAgentRole) {
      fetchAgents();
    }
  }, [selectedAgentRole]);

  const fetchAgents = async () => {
    try {
        console.log('Fetching agents for scenario:', selectedScenario); // 调试输出
        // 首先获取 model.json 数据
        const modelResponse = await axios.get('tmp/model.json');
        const models = modelResponse.data; // 假设 data 是一个数组
        // 动态构建URLs，这里假设 model.json 中的每个对象都有一个 id 属性用来构造URL
        const urls = models.map(model => `http://localhost:3002/${model.id || models.indexOf(model)}`);
        // 使用Promise.all并发请求所有URL的数据
        const responses = await Promise.all(urls.map(url => axios.get(url)));
        // 打印原始响应，以便验证其结构
        console.log('Raw responses:', responses);
        // 将所有响应的数据聚合到一个数组中
        let allData = [];
        for (let response of responses) {
            // 直接将response.data作为数组添加，假设它已经是正确的格式
            allData = allData.concat(response.data);
        }

        // 打印合并后的数据，以便验证过滤前的数据量
        console.log('All data combined:', allData);

        // 根据 selectedScenario 筛选出相关的智能体
        const filteredAgents = allData.filter(agent => 
          agent.scenarioID === selectedScenario.id);

        // 打印筛选后的数据，以便验证最终数量
        console.log('Filtered agents:', filteredAgents);

        // 更新状态
        setAgents(filteredAgents);
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};
const modelList = [
  { scenarioID: '1', agentRoleID: '2', agentName: '3',decisionModelID:'4',agentType:'5' }];
  const scenarioColumns = [
    {
      title: '想定场景',
      dataIndex: 'scenarioID',
      key: 'scenarioID',
    },
    {
      title: '智能体角色',
      dataIndex: 'agentRoleID',
      key: 'agentRoleID',
    },
    {
      title: '智能体ID',
      dataIndex: 'agentID',
      key: 'agentID',
    },
    {
      title: '智能体名称',
      dataIndex: 'agentName',
      key: 'agentName',
    },{
      title: '版本',
      dataIndex: 'agentVersion',
      key: 'agentVersion',
    },
    {
      title: '智能体类型',
      dataIndex: 'agentType',
      key: 'agentType',
    },
    
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: time => new Date(time).toLocaleString(),
    },
    {
      title: '代理实体',
      dataIndex: 'entities',
      key: 'entities',
      render: (text, record) => (
        // 假设每个智能体的实体不多，我们直接将它们列在一个单元格中
        record.entities.map(entity => entity.name).join(', ') || '无'
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="primary" onClick={() => handleLoad(record)}>
            载入
          </Button>
        </div>
      ),
    },
  ];
  const modelListColumns = [
    {
      title: '想定场景',
      dataIndex: 'scenarioID',
      key: 'scenarioID',
    },
    {
      title: '智能体角色',
      dataIndex: 'agentRoleID',
      key: 'agentRoleID',
    },
    {
      title: '智能体名称',
      dataIndex: 'agentName',
      key: 'agentName',
    },
    {
      title: '决策模型ID',
      dataIndex: 'decisionModelID',
      key: 'decisionModelID',
    },
    {
      title: '智能体类型',
      dataIndex: 'agentType',
      key: 'agentType',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleViewModel(record)}>
            查看
          </Button>
          <Button type="primary" onClick={() => handleEffectModel(record)}>
            效果
          </Button>
          <Button type="primary" onClick={() => handlePublishModel(record)}>
            发布
          </Button>
        </div>
      ),
    },
  ];
  const modelInfoColumns = [
    // 根据需要添加更多的列来展示模型的详细信息
    {
      title: '输入情况',
      dataIndex: 'inputInfo',
      key: 'inputInfo',
    },
    {
      title: '输出情况',
      dataIndex: 'outputInfo',
      key: 'outputInfo',
    },
  ];
  
  const [hyperParametersValues, setHyperParametersValues] = useState({});

  const trainAlgorithm = async () => {
    setTraining(true);
    try {
      const response = await axios.post('http://localhost:5000/train', {
        hyperParametersValues
      });
      console.log(response.data);
      // 训练完成，显示弹窗
      setIsSuccessModalVisible(true);
      setTraining(false);
    } catch (error) {
      console.error('训练过程中发生错误:', error);
      message.error('训练失败，请检查日志');
      setTraining(false);
    }
  };

  const handleViewModelListClick = () => {
    setIsModelListModalVisible(true);
  };
  const handleViewModel = (model) => {
    setCurrentModel(model); // 设置当前模型为选中的模型
    setIsModelInfoModalVisible(true); // 显示模型信息弹窗
  };
  const handleEffectModel = async (record) => {
    alert(`模拟加载模型 ${record.decisionModelID} 的训练效果图表`);
    // try {
    //   // 假设后端接口URL和请求参数，这里需要根据实际情况替换
    //   const response = await axios.get(`http://localhost:5000/charts/${record.decisionModelID}`);
    //   const data = response.data; // 假设后端返回的数据格式是 { rewardCurve: [...], ... }
    //   setChartData(data); // 存储图表数据
    //   setIsChartModalVisible(true); // 显示模态框
    // } catch (error) {
    //   console.error('获取图表数据失败:', error);
    //   message.error('图表数据加载失败，请检查网络或联系管理员');
    // }
  };
  const handlePublishModel = async (record) => {
    alert(`模拟发布模型 ${record.decisionModelID} 作为决策服务`);
    // try {
    //   // 假设后端接口URL，这里需要根据实际情况替换
    //   const response = await axios.post('http://localhost:5000/publish', {
    //     decisionModelID: record.decisionModelID,
    //     // 可以添加其他需要发送的模型信息
    //   });
    //   console.log(response.data);
    //   message.success('模型发布成功');
    // } catch (error) {
    //   console.error('模型发布失败:', error);
    //   message.error('模型发布失败，请检查网络或联系管理员');
    // }
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

  console.log('Selected Scenario:', selectedScenario);
    // 调试输出，确保 selectedAlgorithm 和 hyperParameters 是按预期接收的
  console.log('Selected Algorithm:', selectedAlgorithm);

  if (!selectedAlgorithm || !selectedAlgorithm['hyper-parameters']) {
    return <div>请选择一个算法</div>;
  }
  
    const hyperParameters = selectedAlgorithm['hyper-parameters'];
  
  return (
    <div>
       {/* 展示选中的想定场景详情 */}
       {selectedScenario && agents.length > 0 && (
        <Card title="已选想定场景、智能体角色的智能体设计列表" bordered={true} style={{ marginBottom: 16 }}>
          <Table
            columns={scenarioColumns}
            dataSource={agents.map((agent, index) => ({ ...agent, key: index }))}
            pagination={{
              pageSize: 2,
              showQuickJumper: true,
            }}
            bordered
          />
        </Card>
      )}
      <Card
        title={
          <div style={{ backgroundColor: '#f0f0f0', fontSize: '24px', textAlign: 'center' }}>
            训练超参数
            <SettingOutlined style={{ marginLeft: 8 }} />
          </div>
        }
        bordered={true}
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          {hyperParameters.map((param, index) => {
            // 确保 value 数组中的值是唯一的并排序
            const uniqueValues = [...new Set(param.value)].sort((a, b) => a - b);

            // 确保默认值存在于 value 数组中
            const defaultValueExists = uniqueValues.includes(param.default);
            const defaultValue = defaultValueExists ? param.default : uniqueValues[0]; // 如果默认值不存在，则选择第一个值

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
      <div className='button'>
      <Button onClick={trainAlgorithm} disabled={training}>
        {training ? '训练中...' : '开始训练'}
      </Button>
        <Button onClick={handleViewModelListClick}>
          查看模型列表
        </Button>
        <Button>
          训练终止
        </Button>
        <div>
          {training ? (
            <div style={{ color: 'blue', fontWeight: 'bold' }}>训练中，请稍候...</div>
          ) : (
            <div style={{ color: 'green', fontWeight: 'bold' }}>开始训练</div>
          )}
        </div>
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
              
              {/* 状态信息 */}
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
              {/* 动作信息 */}
              <h3>动作信息</h3>
              {selectedAgent.entities.map((entity, index) => (
                <div key={index}>
                  <p><strong>实体名称：</strong>{entity.name}</p>
                  <p><strong>动作：</strong>{entity.actionSpace ? entity.actionSpace.map(action => action.action.join(' ')).join(', ') : '无'}</p>
                  <p><strong>规则：</strong>{entity.actionSpace ? entity.actionSpace.map(action => action.rule.join(' ')).join(', ') : '无'}</p>
                </div>
              ))}

              {/* 奖励信息 */}
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
          pagination={false} // 如果模型列表很长，可以考虑添加分页
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
          {/* 展示模型的输入输出情况 */}
          <Table
            columns={modelInfoColumns}
            dataSource={[currentModel]} // 假设 currentModel 包含了所有需要展示的信息
            pagination={false}
          />
        </div>
      )}
    </Modal>
    <Modal
      title="训练状态"
      visible={isSuccessModalVisible}
      onOk={() => {
        setIsSuccessModalVisible(false); // 关闭弹窗
      }}
      onCancel={() => {
        setIsSuccessModalVisible(false); // 关闭弹窗
      }}
      footer={[
        <Button key="ok" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
          确定
        </Button>,
      ]}
    >
      <p>训练完成！</p>
    </Modal>
    </div>
    
  );
};

export default Right;