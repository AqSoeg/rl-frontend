// right.jsx
import React, { useState,useEffect } from 'react';
import { Card, Select, Row, Col, Space ,Button, Modal ,Table, message} from 'antd';
import {  SettingOutlined } from '@ant-design/icons';
import { intelligentStore } from './IntelligentStore';
import axios from 'axios';
const { Option } = Select;

const Right = ({ selectedAlgorithm,selectedScenario,algorithms }) => { // 接收 scenarios 作为 props
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  
  const handleLoad = (agent) => {
    intelligentStore.loadAgent(agent);
  };

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
        const filteredAgents = allData.filter(agent => agent.scenarioID === selectedScenario.id);

        // 打印筛选后的数据，以便验证最终数量
        console.log('Filtered agents:', filteredAgents);

        // 更新状态
        setAgents(filteredAgents);
    } catch (error) {
        console.error("Error fetching agents:", error);
    }
};

  const scenarioColumns = [
    {
      title: '想定场景',
      dataIndex: 'scenarioID',
      key: 'scenarioID',
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
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleView(record)}>
            查看
          </Button>
          <Button type="primary" onClick={() => handleEffect(record)}>
            效果
          </Button>
          <Button type="primary" onClick={() => handleLoad(record)}>
            载入
          </Button>
        </div>
      ),
    },
  ];
  const [hyperParametersValues, setHyperParametersValues] = useState({});
  // const algorithmMap = {
  //   PPO: PPO,
  //   DDPG: DDPG,
  //   // 如果有其他算法，继续添加到这个对象中
  // };
  const trainAlgorithm = async () => {
    try {
      // 从映射中获取选中的算法类
      // const AlgorithmClass = algorithmMap[selectedAlgorithm.name];
  
      // // 创建环境，这里需要替换为您的具体环境
      // const env = gym.make('YourEnvironmentName');
  
      // // 初始化模型
      // const model = new AlgorithmClass('MlpPolicy', env, hyperParametersValues, { verbose: 1 });
  
      // // 训练模型
      // await model.learn(total_timesteps=hyperParametersValues['total_step']);
  
      // // 保存模型为 .pkl 文件
      const modelPath = `./algorithm/${selectedAlgorithm.name}.pkl`;
      // await model.save(modelPath);
  
      // console.log(`模型已保存到 ${modelPath}`);
      console.log('参数值',hyperParametersValues)
      message.success(`训练完成并保存为 .pkl 文件,pkl文件保存到了 ${modelPath}中`);
    } catch (error) {
      console.error('训练过程中发生错误:', error);
      message.error('训练失败，请检查日志');
    }
  };
  
  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalVisible(true);
  };

  const handleEffect = (key) => {
    message.info(`查看智能体 ${key} 的效果`);
    // 在这里添加查看效果的逻辑
  };

  const handleOk = () => {
    setIsDetailModalVisible(false);
  };

  const handleCancel = () => {
    setIsDetailModalVisible(false);
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
        <Card title="已选想定场景详情" bordered={true} style={{ marginBottom: 16 }}>
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
        <Button onClick={trainAlgorithm}>
          开始训练
        </Button >
        <Button>
          训练终止
        </Button>
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
              <p><strong>更新时间：</strong>{selectedAgent.updateTime}</p>
              <p><strong>想定场景：</strong>{selectedAgent.scenarioID}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
    
  );
};

export default Right;