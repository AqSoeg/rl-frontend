import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';

const ModelLibrary = () => {
  const [models, setModels] = useState([
    { key: '1', id: 'DCT01', name: 'XX模型', version: 'v1.0', type: '多智能体模型', role: '角色1', date: '2024-09-01' },
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
    // 更新模型数据的逻辑
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key' },
    { title: '模型ID', dataIndex: 'id', key: 'id' },
    { title: '模型名称', dataIndex: 'name', key: 'name' },
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '模型类型', dataIndex: 'type', key: 'type' },
    { title: '智能体角色', dataIndex: 'role', key: 'role' },
    { title: '更新时间', dataIndex: 'date', key: 'date' },
    { title: '操作', key: 'action', render: () => (
      <>
        <Button type="link" onClick={() => showModal(models[0])}>查看</Button>
        <Button type="link">更新</Button>
        <Button type="link">删除</Button>
      </>
    ) },
  ];

  return (
    <div>
      <Table columns={columns} dataSource={models} />
      <Modal title="模型详情" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form>
          <Form.Item label="模型ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="模型名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="版本" name="version">
            <Input />
          </Form.Item>
          <Form.Item label="模型类型" name="type">
            <Input />
          </Form.Item>
          <Form.Item label="智能体角色" name="role">
            <Input />
          </Form.Item>
          <Form.Item label="更新时间" name="date">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ModelLibrary;