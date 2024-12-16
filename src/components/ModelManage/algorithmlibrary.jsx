import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const AlgorithmLibrary = () => {
  const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('modelId'); // 默认搜索字段
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get('http://localhost:3000/agents');
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
    let updatedModels;
    
    if (!isEditing) {
      // 更新现有模型时，先更新对应的模型，然后更新所有模型的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      updatedModels = models.map(modelItem =>
        modelItem.key === currentModel.key ? { ...modelItem, ...values, updateTime: now } : modelItem
      );
    } else {
      // 添加新模型时，首先添加新模型，然后更新所有模型的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      const newModel = {
        ...values,
        key: `${models.length + 1}`,
        modelId: values.id || `NEW-${Date.now()}`, // 如果没有提供ID，则使用时间戳生成一个临时ID
        updateTime: now,
      };
      updatedModels = [...models, newModel];
    }

    // 更新所有模型的 key 和 序号，以保持连续性
    updatedModels = updatedModels.map((model, index) => ({
      ...model,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));

    setModels(updatedModels); // 使用新的规则列表更新状态
    setFilteredModels(updatedModels); // 同步过滤后的数据
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDelete = (model) => {
    let updatedModels = filteredModels.filter(m => m.key !== model.key);
    // 更新所有模型的 key 和 序号，以保持连续性
    updatedModels = updatedModels.map((model, index) => ({
      ...model,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setModels(updatedModels);
    setFilteredModels(updatedModels); // 同步过滤后的数据
  };

  const handleSearch = () => {
    const filteredModels = models.filter(model =>
      String(model[searchField]).includes(searchText)
    );
    setFilteredModels(filteredModels);
  };

  const addModel = () => {
    // 创建一个新的模型对象，确保key和id是唯一的
    const newModel = {
      key: '',
      sceneId: '', // 默认为空，待用户填写
      modelId: '', // 默认为空，待用户填写
      modelName: '', // 默认为空，待用户填写
      agentType: '', // 默认为空，待用户填写
      structure: '', // 默认为空，待用户填写
      version: '', // 默认为空，待用户填写
      input: '',
      output: '',
      route: '',
      updateTime: '', // 默认为空，将在保存时填充
    };
    setCurrentModel(newModel);
    form.setFieldsValue(newModel);
    setIsModalVisible(true);
    setIsEditing(true); // 标记为编辑状态，这样表单字段就是可编辑的
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
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '模型结构', dataIndex: 'structure', key: 'structure' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '输入', dataIndex: 'input', key: 'input' },
    { title: '输出', dataIndex: 'output', key: 'output' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    { title: '存储路径', dataIndex: 'route', key: 'route' },
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
        算法模型管理
        <SettingOutlined style={{ marginLeft: 8 }} /> {/* 功能图标 */}
      </div>} bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="sceneId">想定场景</Select.Option>
        <Select.Option value="modelId">智能体ID</Select.Option>
        <Select.Option value="modelName">智能体名称</Select.Option>
        <Select.Option value="agentType">智能体类型</Select.Option>
        <Select.Option value="structure">模型结构</Select.Option>
        <Select.Option value="updateTime">更新时间</Select.Option>
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>搜索</Button>
      <Table columns={columns} dataSource={filteredModels} pagination={{ pageSize: 5 }} />
      <Modal title={isEditing ? "新增模型" : "模型详情"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel} onFinish={handleFinish}>
          <Form.Item label="智能体ID" name="modelId">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="智能体名称" name="modelName">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="智能体类型" name="agentType">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="模型结构" name="structure">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="版本" name="version">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="输入" name="input">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="输出" name="output">
            <Input disabled={!isEditing} />
          </Form.Item>
          {!isEditing ? (
            <Form.Item label="更新时间" name="updateTime">
              <Input disabled={!isEditing} />
            </Form.Item>
          ) : null}
          {isEditing && (
            <Form.Item label="存储路径" name="route">
              <Input disabled={!isEditing} />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Button type="primary" icon={<PlusOutlined />} onClick={addModel} style={{ marginBottom: 20 }}>
        新增模型
      </Button>
    </Card>
  );
};

export default AlgorithmLibrary;