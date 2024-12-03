import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';

const BehaviorLibrary = () => {
  const [rules, setRules] = useState([
    { key: '1', id: 'role_1111', scenario: '场景1', role: '角色1', action: '动作1', type: 'MAX', condition1: '条件1', content1: null, content2: null },
    { key: '2', id: 'role_1221', scenario: '场景1', role: '角色2', action: '动作2', type: 'IF ELSE', condition1: '条件2', content1: '动作无效', content2: null },
    { key: '3', id: 'role_2331', scenario: '场景2', role: '角色3', action: '动作3', type: 'WHILE', condition1: 'TRUE', content1: '执行1', content2: '执行2' },
    // 更多规则...
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);

  const showModal = (rule) => {
    setCurrentRule(rule);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    // 更新规则的逻辑
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key' },
    { title: '行为规则ID', dataIndex: 'id', key: 'id' },
    { title: '想定场景', dataIndex: 'scenario', key: 'scenario' },
    { title: '智能体角色', dataIndex: 'role', key: 'role' },
    { title: '动作', dataIndex: 'action', key: 'action' },
    { title: '行为规则类型', dataIndex: 'type', key: 'type' },
    { title: '条件1', dataIndex: 'condition1', key: 'condition1' },
    { title: '条件2', dataIndex: 'condition2', key: 'condition2', render: () => <span>/</span> },
    { title: '内容1', dataIndex: 'content1', key: 'content1' },
    { title: '内容2', dataIndex: 'content2', key: 'content2' },
    { title: '操作', key: 'action', render: () => (
      <>
        <Button type="link" onClick={() => showModal(rules[0])}>查看</Button>
        <Button type="link">更新</Button>
        <Button type="link">删除</Button>
      </>
    ) },
  ];

  return (
    <div>
      <h2>行为规则模型管理</h2>
      <Form>
        <Form.Item label="检索">
          <Input placeholder="单行输入" />
        </Form.Item>
        <Form.Item>
          <Button type="primary">检索</Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={rules} />
      <Modal title="规则详情" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form>
          <Form.Item label="行为规则ID" name="id">
            <Input disabled />
          </Form.Item>
          <Form.Item label="想定场景" name="scenario">
            <Input />
          </Form.Item>
          <Form.Item label="智能体角色" name="role">
            <Input />
          </Form.Item>
          <Form.Item label="动作" name="action">
            <Input />
          </Form.Item>
          <Form.Item label="行为规则类型" name="type">
            <Input />
          </Form.Item>
          <Form.Item label="条件1" name="condition1">
            <Input />
          </Form.Item>
          <Form.Item label="条件2" name="condition2">
            <Input disabled />
          </Form.Item>
          <Form.Item label="内容1" name="content1">
            <Input />
          </Form.Item>
          <Form.Item label="内容2" name="content2">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BehaviorLibrary;