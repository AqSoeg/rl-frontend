import React from 'react';
import { Card, Table, Button, Select,Space } from 'antd';
import { EyeOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import { intelligentStore } from './IntelligentStore';
const { Option } = Select;
const Right = observer(() => {
  const handleLoad = (key) => {
    const agent = intelligentAgents.find(a => a.key === key);
    intelligentStore.loadAgent(agent);
  };
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

  
  const hyperParameterNames = [
    'Actor学习率', 'Critic学习率', '折扣率', '模型保存频率', '日志打印频率',
    '总训练步数', '超参数7', '超参数8', '超参数9', '超参数10'
  ];

  // 定义数值选项
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
  //定义默认值选项
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
      <Card title="智能体载入">
        <Table dataSource={intelligentAgents} columns={columns} pagination={false} />
      </Card>
      <Card title="训练超参数" headStyle={{ backgroundColor: '#8dbaf1' }}>
            <Space className="hyper-params" size="middle">
              {hyperParameterNames.map((name, index) => (
                <Space key={index} align="baseline">
                  <Select className='value' defaultValue={name}>
                      <Option value={name}>{name}</Option>
                  </Select>
                  <span>:</span>
                  <Select className='value' defaultValue={defaultParameterValues[name]}>
                    {valueOptions[name].map((value, idx) => (
                      <Option key={`${name}-${idx}`} value={value}>{value}</Option>
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
});

export default Right;