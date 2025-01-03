import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const ModelLibrary = ({ data }) => {
  const [models, setModels] = useState(data || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (Array.isArray(data)) {
      // 如果数据是数组，确保每个对象都有唯一的key
      const modelsWithKeys = data.map((item, index) => ({ ...item, key: index }));
      setModels(modelsWithKeys);
    } else if (data !== null && typeof data === 'object') {
      // 如果数据是对象，将其包装在数组中并添加key
      setModels([data]);
    } else {
      console.error('Data is not an array:', data);
    }
  }, [data]);

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
    const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
    let newModels = models.map(modelItem =>
      modelItem.key === currentModel.key ? { ...modelItem, ...values, updateTime: now } : modelItem
    );
    newModels = newModels.map((model, index) => ({
      ...model,
      key: index, // 确保key是唯一的
    }));

    setIsModalVisible(false);
    setModels(newModels); // 更新父组件的状态
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
    const updatedModels = models.filter(m => m.key !== model.key); // 使用key来过滤
    updatedModels.forEach((model, index) => {
      model.key = index; // 重新分配key
    });
    setModels(updatedModels); // 使用setModels更新状态
  };

  const handleSearch = () => {
    const filteredModels = models.filter(model =>
      String(model[searchField]).includes(searchText)
    );
    setModels(filteredModels); // Update parent component's state
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => index + 1, // 动态计算序号
    },
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID' },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
    {
      title: '实体分配',
      dataIndex: 'entityAssignments',
      key: 'entityAssignments',
      render: (text, record) => {
        // 提取 entityAssignments 中的智能体和实体名称
        const assignments = record.entityAssignments.map((assignment, index) => {
          const agentName = Object.keys(assignment)[0]; // 获取智能体名称
          const entities = assignment[agentName].join(', '); // 获取实体名称并拼接成字符串
          return `${agentName}: ${entities}`; // 返回智能体和实体名称的组合
        });

        // 使用 <div> 包裹每个智能体和实体分配的组合
        return (
          <div>
            {assignments.map((assignment, index) => (
              <div key={index}>{assignment}</div>
            ))}
          </div>
        );
      },
    },
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
        <Select.Option value="scenarioID">想定场景</Select.Option>
        <Select.Option value="agentID">智能体ID</Select.Option>
        <Select.Option value="agentName">智能体名称</Select.Option>
        <Select.Option value="agentType">智能体类型</Select.Option>
        <Select.Option value="agentRoleID">智能体角色</Select.Option>
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
      <Table columns={columns} dataSource={models} pagination={{ pageSize: 3 }} />
      <Modal title={isEditing ? "更新模型" : "模型详情"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel} onFinish={handleFinish}>
          {currentModel && (
            <>
              <Form.Item label="模型ID" name="agentID">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="模型名称" name="agentName">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="版本" name="agentVersion">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="模型类型" name="agentType">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="智能体角色" name="agentRoleID">
                <Input disabled={!isEditing} />
              </Form.Item>
              {!isEditing ? (
                <Form.Item label="更新时间" name="updateTime">
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