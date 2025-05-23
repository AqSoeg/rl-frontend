import React, { useState, useEffect } from'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from'react-router-dom';

const ModelLibrary = ({ data, fetchModels }) => {
  const [models, setModels] = useState(data || []);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (Array.isArray(data)) {
      const modelsWithKeys = data.map((item, index) => ({...item, key: index }));
      setModels(modelsWithKeys);
    } else if (data!== null && typeof data === 'object') {
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

  const handleFinish = async (values) => {
    try {
      const response = await fetch(__APP_CONFIG__.updateAll, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentModel.agentID,
          type:'model', // 指定库
          data: {...values, updateTime: new Date().toISOString() }, // 动态设置当前时间
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('模型更新成功');
      fetchModels(); // 重新获取数据
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error updating model:', error);
      message.error('模型更新失败');
    }
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

  const handleDelete = async (model) => {
    try {
      const response = await fetch(__APP_CONFIG__.deleteAll, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: model.agentID,
          type:'model', // 指定库
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('模型删除成功');
      fetchModels(); // 重新获取数据
    } catch (error) {
      console.error('Error deleting model:', error);
      message.error('模型删除失败');
    }
  };

  const handleSearch = async () => {
    try {
        const response = await fetch(__APP_CONFIG__.searchAll, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type:'model', // 根据页面类型传入不同的 type
                field: searchField,
                value: searchText
            })
        });

        const result = await response.json();
        if (Array.isArray(result)) {
            setModels(result); // 更新 models 状态
        } else {
            console.error('Expected an array but got:', result);
            setModels([]); // 如果返回的不是数组，设置为空数组
        }
    } catch (error) {
        console.error('Error searching models:', error);
        message.error('模型搜索失败');
    }
};
  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => index + 1,
    },
    { title: '想定场景', dataIndex:'scenarioID', key:'scenarioID' },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime',render: time => new Date(time).toLocaleString()  },
    {
      title: '实体分配',
      dataIndex: 'entityAssignments',
      key: 'entityAssignments',
      render: (text, record) => {
        const assignments = record.entityAssignments.map((assignment, index) => {
          const agentName = Object.keys(assignment)[0];
          const entities = assignment[agentName].join(', ');
          return `${agentName}: ${entities}`;
        });

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
    <Card
      title={
        <div
          style={{
            backgroundColor: '#f0f0f0',
            fontSize: '40px',
            textAlign: 'center',
          }}
        >
          智能体模型管理
          <SettingOutlined style={{ marginLeft: 8 }} />
        </div>
      }
      bordered={true}
    >
      <span>检索：</span>
      <Select
        value={searchField}
        onChange={setSearchField}
        style={{ width: 120, marginRight: 8 }}
      >
        <Select.Option value="scenarioID">想定场景</Select.Option>
        <Select.Option value="agentID">智能体ID</Select.Option>
        <Select.Option value="agentName">智能体名称</Select.Option>
        <Select.Option value="agentType">智能体类型</Select.Option>
        <Select.Option value="agentRoleID">智能体角色</Select.Option>
        <Select.Option value="updateTime">更新时间</Select.Option>
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>
        搜索
      </Button>
      <Table
        columns={columns}
        dataSource={models}
        pagination={{ pageSize: 3 }}
        rowKey={'agentID'}
      />
      <Modal
        title={isEditing? '更新模型' : '模型详情'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
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
              {!isEditing && (
                <Form.Item label="更新时间" name="updateTime">
                  <Input disabled={true} />
                </Form.Item>
              )}
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