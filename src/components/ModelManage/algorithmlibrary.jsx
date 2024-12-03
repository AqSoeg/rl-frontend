import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker } from 'antd';

const { Option } = Select;

const AlgorithmLibrary = () => {
  const [models, setModels] = useState([
    { key: '1', scenario: '场景1', id: 'DCT-01', name: 'XX模型', type: '多智能体模型', structure: 'Actor-Critic', version: 'v1.0', input: '', output: '', updateTime: '2024年9月1日 11:12:58' },
    { key: '2', scenario: '场景1', id: 'DCT-02', name: '分布式XX模型', type: '分布式多智能体', structure: '分布式Actor-Critic', version: 'v1.1', input: '', output: '', updateTime: '2024年9月1日 11:12:58' },
    { key: '3', scenario: '场景2', id: 'GL-03', name: 'XX管理模型', type: '单智能体', structure: 'Actor-Critic', version: 'v1.0', input: '', output: '', updateTime: '2024年9月1日 11:12:58' },
    // 更多模型数据...
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);

  const showModal = (model) => {
    setCurrentModel(model);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    // 更新模型的逻辑
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key' },
    { title: '想定场景', dataIndex: 'scenario', key: 'scenario' },
    { title: '智能体ID', dataIndex: 'id', key: 'id' },
    { title: '智能体名称', dataIndex: 'name', key: 'name' },
    { title: '智能体类型', dataIndex: 'type', key: 'type' },
    { title: '模型结构', dataIndex: 'structure', key: 'structure' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '输入', dataIndex: 'input', key: 'input' },
    { title: '输出', dataIndex: 'output', key: 'output' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    { title: '操作', key: 'action', render: () => (
      <>
        <Button type="link" onClick={() => showModal(models[0])}>查看</Button>
        <Button type="link">删除</Button>
      </>
    ) },
  ];

  return (
    <div>
      <h2>算法模型管理</h2>
      <Form>
        <Form.Item label="检索">
          <Select defaultValue="场景1" style={{ width: 120 }}>
            <Option value="场景1">场景1</Option>
            <Option value="场景2">场景2</Option>
          </Select>
          <Input placeholder="单行输入" style={{ width: 200, marginLeft: 8 }} />
          <Button type="primary" style={{ marginLeft: 8 }}>检索</Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={models} />
      <Modal title="模型详情" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form>
          <Form.Item label="智能体ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="智能体名称" name="name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="智能体类型" name="type">
            <Input disabled />
          </Form.Item>
          <Form.Item label="模型结构" name="structure">
            <Input disabled />
          </Form.Item>
          <Form.Item label="版本" name="version">
            <Input disabled />
          </Form.Item>
          <Form.Item label="输入" name="input">
            <Input disabled />
          </Form.Item>
          <Form.Item label="输出" name="output">
            <Input disabled />
          </Form.Item>
          <Form.Item label="更新时间" name="updateTime">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlgorithmLibrary;