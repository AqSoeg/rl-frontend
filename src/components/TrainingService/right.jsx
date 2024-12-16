// right.jsx
import React, { useState } from 'react';
import { Card, Table, Button, Select, Space, Modal } from 'antd';
import { EyeOutlined, CheckCircleOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import { intelligentStore } from './IntelligentStore';
const { Option } = Select;

const Right = observer(({ scenarios}) => { // 接收 scenarios 作为 props
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const handleLoad = (key) => {
    const agent = agents.find(a => a.key === key);
    intelligentStore.loadAgent(agent);
  };

  const dataSource = scenarios.flatMap(scenario =>
    scenario.agentRoles.flatMap(role => role.entities.map(entity => ({
      key: entity.entityId,
      id: scenario.id,
      agentId: entity.agentId,
      AgentName: role.AgentName,
      version: '1.0', // 假设版本号，或者从数据中获取
      AgentType: role.AgentType,
      updateTime: role.更新时间, // 确保时间格式正确
    })))
  );
  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key', render: (text, record, index) => index + 1 },
    { title: '想定场景', dataIndex: 'id', key: 'id', render: (text, record) => {
        const scenario = scenarios.find(s => s.id === record.id);
        return scenario ? scenario.name : '未知场景';
      }},
    { title: '智能体ID', dataIndex: 'agentId', key: 'agentId' },
    { title: '智能体名称', dataIndex: 'AgentName', key: 'AgentName' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '智能体类型', dataIndex: 'AgentType', key: 'AgentType' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            查看
          </Button>
          <Button icon={<CheckCircleOutlined />} onClick={() => handleEffect(record.key)}>
            效果
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => handleLoad(record.key)}>
            载入
          </Button>
        </Space>
      ),
    },
  ];

  // 假设你想在表格中显示 scenarios 的信息，可以创建一个新列来显示场景名称
  const extendedColumns = [
    ...columns,
    {
      title: '场景名称',
      key: 'sceneName',
      render: (text, record) => {
        const scenario = scenarios.find(s => s.id === record.sceneId);
        return scenario ? scenario.name : '未知场景';
      },
    },
  ];

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

  const hyperParameterNames = [
    'Actor学习率',
    'Critic学习率',
    '折扣率',
    '模型保存频率',
    '日志打印频率',
    '总训练步数',
    '超参数7',
    '超参数8',
    '超参数9',
    '超参数10',
  ];

  const valueOptions = {
    'Actor学习率': ['1e-2', '1e-3', '1e-4'],
    'Critic学习率': ['1e-2', '1e-3', '1e-4', '1e-5'],
    '折扣率': ['0.9', '0.95', '0.99'],
    '模型保存频率': ['100', '1000', '10000'],
    '日志打印频率': ['1', '5', '10', '50', '100'],
    '总训练步数': ['1e-5', '2e-5', '5e-5', '1e-6', '2e-6', '5e-6', '1e-7'],
    '超参数7': ['value4', 'value5', 'value6'],
    '超参数8': ['value7', 'value8', 'value9'],
    '超参数9': ['value10', 'value11', 'value12'],
    '超参数10': ['value13', 'value14', 'value15'],
  };

  const defaultParameterValues = {
    'Actor学习率': '1e-3',
    'Critic学习率': '1e-4',
    '折扣率': '0.99',
    '模型保存频率': '100',
    '日志打印频率': '1',
    '总训练步数': '1e-5',
    '超参数7': '0.03',
    '超参数8': '0.04',
    '超参数9': '0.05',
    '超参数10': '0.06',
  };

  return (
    <div>
      <Card
        title={
          <div style={{ backgroundColor: '#f0f0f0', fontSize: '40px', textAlign: 'center' }}>
            智能体载入
            <SettingOutlined style={{ marginLeft: 8 }} />
          </div>
        }
        bordered={true}
      >
        <Table dataSource={dataSource} columns={extendedColumns} pagination={{ pageSize: 3 }} />
      </Card>
      <Card
        title={
          <div style={{ backgroundColor: '#f0f0f0', fontSize: '40px', textAlign: 'center' }}>
            训练超参数
            <SettingOutlined style={{ marginLeft: 8 }} />
          </div>
        }
        bordered={true}
      >
        <Space className="hyper-params" size="middle">
          {hyperParameterNames.map((name, index) => (
            <Space key={index} align="baseline">
              <Select className='value' defaultValue={name}>
                <Option value={name}>{name}</Option>
              </Select>
              <span>:</span>
              <Select className='value' defaultValue={defaultParameterValues[name]}>
                {valueOptions[name].map((value, idx) => (
                  <Option key={`${name}-${idx}`} value={value}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Space>
          ))}
        </Space>
      </Card>
      <div className='button'>
        <Button>
          开始训练
        </Button>
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
              <p><strong>智能体名称：</strong>{selectedAgent.modelName}</p>
              <p><strong>智能体ID：</strong>{selectedAgent.modelId}</p>
              <p><strong>版本：</strong>{selectedAgent.version}</p>
              <p><strong>智能体类型：</strong>{selectedAgent.agentType}</p>
              <p><strong>更新时间：</strong>{selectedAgent.updateTime}</p>
              <p><strong>想定场景：</strong>{selectedAgent.sceneId}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
    
  );
});

export default Right;