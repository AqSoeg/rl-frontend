import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';
import axios from 'axios';

const ModelLibrary = () => {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]); // 新增状态用于存储过滤后的数据
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState(''); // 默认搜索字段
  const [form] = Form.useForm();

  // 获取场景数据
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:3000/agents');
        // 为每个模型对象添加一个唯一的 key 属性
        const modelsWithKey = response.data.map((model, index) => ({
          ...model,
          key: `${index + 1}`, // 确保 key 是字符串类型
        }));
        setModels(modelsWithKey);
        setFilteredModels(modelsWithKey); // 初始化过滤后的数据
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    fetchModels();
  }, []);

  const showModal = (model) => {
    setCurrentModel(model);
    form.setFieldsValue(model);
    setIsModalVisible(true);
    setIsEditing(false);
  };

  const handleOk = () => {
    if (isEditing) {
      form.submit();
    } else {
      setIsModalVisible(false);
    }
  };

  const handleFinish = (values) => {
    let newModels;
    const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
    newModels = filteredModels.map(modelItem =>
      modelItem.key === currentModel.key ? { ...modelItem, ...values, date: now } : modelItem
    );
    newModels = newModels.map((model, index) => ({
      ...model,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setFilteredModels(newModels); // 使用新的规则列表更新过滤后的数据
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const update = (model) => {
    setCurrentModel(model);
    form.setFieldsValue(model);
    setIsModalVisible(true);
    setIsEditing(true);
  };

  const handleDelete = (model) => {
    let updatedModels = filteredModels.filter(m => m.key !== model.key);
    // 更新所有规则的 key 和 序号，以保持连续性
    updatedModels = updatedModels.map((model, index) => ({
      ...model,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setFilteredModels(updatedModels);
  };

  const handleSearch = () => {
    const filteredModels = models.filter(model =>
      String(model[searchField]).includes(searchText)
    );
    setFilteredModels(filteredModels);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => index + 1, // 动态计算序号
    },
    { title: '想定场景', dataIndex: 'sceneId', key: 'sceneId' },
    { title: '智能体ID', dataIndex: 'modelId', key: 'modelId' },
    { title: '智能体名称', dataIndex: 'modelName', key: 'modelName' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '智能体角色', dataIndex: 'agentRoleId', key: 'agentRoleId' },
    { title: '更新时间', dataIndex: 'date', key: 'date' },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => showModal(record)}>查看</Button>
          <Button type="link" onClick={() => update(record)}>更新</Button>
          <Button type="link" onClick={() => handleDelete(record)}>删除</Button>
        </>
      ),
    },
  ];

  return (
    <Card title={
      <div style={{ backgroundColor: '#f0f0f0', fontSize: '40px', textAlign: 'center' }}>
        智能体模型管理
        <SettingOutlined style={{ marginLeft: 8 }} /> {/* 功能图标 */}
      </div>
    } bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="sceneId">想定场景</Select.Option>
        <Select.Option value="modelId">智能体ID</Select.Option>
        <Select.Option value="modelName">智能体名称</Select.Option>
        <Select.Option value="agentType">智能体类型</Select.Option>
        <Select.Option value="agentRoleId">智能体角色</Select.Option>
        <Select.Option value="date">更新时间</Select.Option>
        {/* 添加其他搜索条件 */}
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>搜索</Button>
      <Table columns={columns} dataSource={filteredModels} pagination={{ pageSize: 5 }} />
      <Modal title={isEditing ? "更新模型" : "模型详情"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel} onFinish={handleFinish}>
          {currentModel && (
            <>
              <Form.Item label="模型ID" name="modelId">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="模型名称" name="modelName">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="版本" name="version">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="模型类型" name="agentType">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="智能体角色" name="agentRoleId">
                <Input disabled={!isEditing} />
              </Form.Item>
              {!isEditing ? (
                <Form.Item label="更新时间" name="date">
                  <Input disabled={!isEditing} />
                </Form.Item>
              ) : null}
            </>
          )}
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

export default ModelLibrary;