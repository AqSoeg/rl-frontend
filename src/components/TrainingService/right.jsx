import React from 'react';
import { Card, Table, Button, Select,Space } from 'antd';
import { EyeOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;
const Right = () => {
  // 假设的数据，您需要根据实际情况进行调整
  const intelligentAgents = [
    { key: '1', id: 'DCT-01', name: 'XX模型', version: 'v1.0', type: '多智能体模型', updateTime: '2024年9月1日 11:12:58' },
    { key: '2', id: 'DCT-02', name: '分布式XX模型', version: 'v1.0', type: '分布式多智能体', updateTime: '2024年9月1日 11:12:58' },
    { key: '3', id: 'GL-03', name: 'XX管理模型', version: 'v1.1', type: '单智能体', updateTime: '2024年9月1日 11:12:58' },
    // 更多智能体...
  ];
  
  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key' },
    { title: '模型ID', dataIndex: 'id', key: 'id' },
    { title: '智能体名称', dataIndex: 'name', key: 'name' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '智能体类型', dataIndex: 'type', key: 'type' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => handleView(record.key)}>
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
  const handleView = (key) => {
    message.info(`查看智能体 ${key} 的详细信息`);
    // 在这里添加查看的逻辑
  };
  
  const handleEffect = (key) => {
    message.info(`查看智能体 ${key} 的效果`);
    // 在这里添加查看效果的逻辑
  };
  
  const handleLoad = (key) => {
    message.info(`载入智能体 ${key}`);
    // 在这里添加载入的逻辑
  };
  
  const hyperParameterNames = [
    'Actor学习率', 'Critic学习率', '折扣率', 'episode长度', 'ppo clip参数',
    '超参数6', '超参数7', '超参数8', '超参数9', '超参数10'
  ];

  // 定义数值选项
  const valueOptions = [
    '1e-3', '1e-4', '0.99', '100', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06'
  ];
  return (
    <div>
      <Card title="智能体载入">
        <Table dataSource={intelligentAgents} columns={columns} pagination={false} />
      </Card>
      <Card title="训练超参数" headStyle={{ backgroundColor: '#8dbaf1' }}>
            <Space className="hyper-params" size="middle">
            {hyperParameterNames.map((name, index) => (
                <Space key={index} align="baseline" style={{ marginBottom: '10px' }}>
                <Select defaultValue={name}>
                    <Option value={name}>{name}</Option>
                </Select>
                <span>:</span>
                <Select defaultValue={valueOptions[index]}>
                    {valueOptions.map((value) => (
                    <Option key={value} value={value}>{value}</Option>
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
    </div>
  );
};

export default Right;