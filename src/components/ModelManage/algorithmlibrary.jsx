import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

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
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState(''); // 默认搜索字段
  const [form] = Form.useForm();


  const showModal = (model) => {
    setCurrentModel(model);
    form.setFieldsValue(model);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleDelete = (model) => {
    const updatedModels = models.filter(m => m.key !== model.key);
    setModels(updatedModels);
  };

  const handleSearch = () => {
    const filteredModels = models.filter(model =>
      model[searchField].includes(searchText)
    );
    setModels(filteredModels);
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
    { title: '操作', key: 'action', render: (text, record) => (
      <>
        <Button type="link" onClick={() => showModal(record)}>查看</Button>
        <Button type="link" onClick={() => handleDelete(record)}>删除</Button>
      </>
    ) },
  ];

  return (
    <Card title={
      <div style={{ backgroundColor: '#f0f0f0', fontSize: '40px', textAlign: 'center' }}>
        智能体模型管理
        <SettingOutlined style={{ marginLeft: 8 }} /> {/* 功能图标 */}
      </div>} bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="scenario">想定场景</Select.Option>
        <Select.Option value="id">智能体ID</Select.Option>
        <Select.Option value="name">智能体名称</Select.Option>
        <Select.Option value="type">智能体类型</Select.Option>
        <Select.Option value="structure">模型结构</Select.Option>
        <Select.Option value="updateTime">更新时间</Select.Option>

        {/* 添加其他搜索条件 */}
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>搜索</Button>
      <Table columns={columns} dataSource={models} />
      <Modal title="模型详情" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel}>
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
      <Link to="/智能体编辑" style={{ marginBottom: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 20 }}>
          新增模型
        </Button>
      </Link>
    </Card>
  );
};

export default AlgorithmLibrary;