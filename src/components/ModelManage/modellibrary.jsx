import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message, Tooltip } from 'antd';
import { PlusOutlined, SettingOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

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
          type: 'model', 
          data: { ...values, updateTime: new Date().toISOString() }, 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('模型更新成功');
      fetchModels(); 
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
          type: 'model', 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('模型删除成功');
      fetchModels(); 
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
          type: 'model',
          field: searchField,
          value: searchText
        })
      });

      const result = await response.json();
      if (Array.isArray(result)) {
        setModels(result); 
      } else {
        console.error('Expected an array but got:', result);
        setModels([]); 
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
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
    },//表格标题不换行style
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', render: time => new Date(time).toLocaleString(), onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
    {
      title: '实体分配',
      dataIndex: 'entityAssignments',
      key: 'entityAssignments',
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
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
      width:150,//操作一列的大小，方便将三个按钮显示在同一行中
      onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
      render: (text, record) => (
        <>
          <Tooltip title="查看">
            <Button type="link" icon={<EyeOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title="更新">
            <Button type="link" icon={<EditOutlined />} onClick={() => update(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </>
        // 三个图标代替文字EyeOutlined眼状表示查看，EditOutlined笔状表示更新，DeleteOutlined垃圾桶表示删除
      ),
    },
  ];

  return (
    <Card
      title={
        <div>
          智能体模型管理
          <SettingOutlined style={{ marginLeft: 8 }} /> {/* 图标离文字的距离*/ }
        </div>
      }
      bordered={true}
    > 
      <span style={{color:'white'}}>检索：</span>
      <Select
        value={searchField}
        onChange={setSearchField}
        style={{ width: 120, marginRight: 8 ,marginBottom:18}} //选项框的样式，大小以及和右侧组件的距离
      >
        <Select.Option value="scenarioID">想定场景</Select.Option>
        <Select.Option value="agentID">智能体ID</Select.Option>
        <Select.Option value="agentName">智能体名称</Select.Option>
        <Select.Option value="agentType">智能体类型</Select.Option>
        <Select.Option value="agentRoleID">智能体角色</Select.Option>
        {/* <Select.Option value="updateTime">更新时间</Select.Option> */}
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }} 
      />
      <Button onClick={handleSearch} >
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
                <Input disabled={true} />
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
                <Input disabled={true} />
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