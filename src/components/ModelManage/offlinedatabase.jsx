import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const OfflineDatabase = () => {
  const [models, setModels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState(''); // 默认搜索字段
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [filteredModels, setFilteredModels] = useState([]);

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
      updatedModels = filteredModels.map(modelItem =>
        modelItem.key === currentModel.key ? { ...modelItem, ...values } : modelItem
      );
    } else {
      // 添加新模型时，首先添加新模型，然后更新所有模型的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      const newModel = {
        ...values,
        key: `${filteredModels.length + 1}`,
        datasetId: values.datasetId || `NEW-${Date.now()}`, // 如果没有提供ID，则使用时间戳生成一个临时ID
        updateTime: now,
      };
      updatedModels = [...filteredModels, newModel];
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
    // 更新所有规则的 key 和 序号，以保持连续性
    updatedModels = updatedModels.map((model, index) => ({
      ...model,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setModels(updatedModels);
    setFilteredModels(updatedModels); // 同步过滤后的数据
  };

  const addDataset = () => {
    const newModel = {
      key: '',
      sceneId: '', // 默认为空，待用户填写
      agentRoleId: '', // 默认为空，待用户填写
      datasetId: '', // 默认为空，待用户填写
      dataId: '', // 默认为空，待用户填写
      statusS: '', // 默认为空，待用户填写
      statusA: '', // 默认为空，待用户填写
      statusR: '',
      statusSJ: '',
      updateTime: '',
      route: '',
    };
    setCurrentModel(newModel);
    form.setFieldsValue(newModel);
    setIsModalVisible(true);
    setIsEditing(true); // 标记为编辑状态，这样表单字段就是可编辑的
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
    { title: '智能体角色', dataIndex: 'agentRoleId', key: 'agentRoleId' },
    { title: '数据集ID', dataIndex: 'datasetId', key: 'datasetId' },
    { title: '数据ID', dataIndex: 'dataId', key: 'dataId' },
    { title: '当前时刻状态(S)', dataIndex: 'statusS', key: 'statusS' },
    { title: '当前时刻执行动作(A)', dataIndex: 'statusA', key: 'statusA' },
    { title: '当前时刻奖励(R)', dataIndex: 'statusR', key: 'statusR' },
    { title: '下一时刻状态(S_)', dataIndex: 'statusSJ', key: 'statusSJ' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    { title: '文件存储路径', dataIndex: 'route', key: 'route' },
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
        离线数据管理
        <SettingOutlined style={{ marginLeft: 8 }} /> {/* 功能图标 */}
      </div>} bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="sceneId">想定场景</Select.Option>
        <Select.Option value="agentRoleId">智能体角色</Select.Option>
        <Select.Option value="datasetId">数据集ID</Select.Option>
        <Select.Option value="dataId">数据ID</Select.Option>
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
      <Table columns={columns} dataSource={filteredModels} pagination={{ pageSize: 5 }} />
      <Modal title={isEditing ? "新增模型" : "模型详情"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel} onFinish={handleFinish}>
          <Form.Item label="想定场景" name="sceneId">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="智能体角色" name="agentRoleId">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="数据集ID" name="datasetId">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="数据ID" name="dataId">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="当前时刻状态(S)" name="statusS">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="当前时刻执行动作(A)" name="statusA">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="当前时刻奖励(R)" name="statusR">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="下一时刻状态(S_)" name="statusSJ">
            <Input disabled={!isEditing} />
          </Form.Item>
          {!isEditing ? (
            <Form.Item label="更新时间" name="updateTime">
              <Input disabled={!isEditing} />
            </Form.Item>
          ) : null}
          {isEditing ? (
            <Form.Item label="文件存储路径" name="route">
              <Input disabled={!isEditing} />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 20 }} onClick={addDataset}>
        新增模型
      </Button>
    </Card>
  );
};

export default OfflineDatabase;