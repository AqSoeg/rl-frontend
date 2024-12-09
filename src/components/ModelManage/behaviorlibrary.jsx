import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import moment from 'moment';

const BehaviorLibrary = () => {
  const [rules, setRules] = useState([
    { key: '1', id: 'role_1111', scenario: '场景1', role: '角色1', action: '动作1', type: 'MAX', condition1: '条件1', content1: null, content2: null },
    { key: '2', id: 'role_1221', scenario: '场景1', role: '角色2', action: '动作2', type: 'IF ELSE', condition1: '条件2', content1: '动作无效', content2: null },
    { key: '3', id: 'role_2331', scenario: '场景2', role: '角色3', action: '动作3', type: 'WHILE', condition1: 'TRUE', content1: '执行1', content2: '执行2' },
    // 更多规则...
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState(''); // 默认搜索字段
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();

  const showModal = (rule) => {
    setCurrentRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleOk = () => {
    if (isEditing) {
      form.submit();
    } else {
      setIsModalVisible(false);
    }
  };



  
  const handleFinish = (values) => {
    let newRules;
    if (isAdding) {
      // 添加新规则时，首先添加新规则，然后更新所有规则的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      const newRule = {
        ...values,
        key: `${rules.length + 1}`,
        id: values.id || `NEW-${Date.now()}`, // 如果没有提供ID，则使用时间戳生成一个临时ID
        date: now,
      };
      newRules = [...rules, newRule];
    } else {
      // 更新现有规则时，先更新对应的规则，然后更新所有规则的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      newRules = rules.map(ruleItem => 
        ruleItem.key === currentRule.key ? { ...ruleItem, ...values, date: now } : ruleItem
      );
    }
    // 更新所有规则的 key 和 序号，以保持连续性
    newRules = newRules.map((rule, index) => ({
      ...rule,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setRules(newRules); // 使用新的规则列表更新状态
    setIsModalVisible(false);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const update = (rule) => {
    setCurrentRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleDelete = (rule) => {
    let updatedRules = rules.filter(m => m.key !== rule.key);
    // 更新所有规则的 key 和 序号，以保持连续性
    updatedRules = updatedRules.map((rule, index) => ({
      ...rule,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setRules(updatedRules);
  };

  const handleSearch = () => {
    const filteredRules = rules.filter(rule =>
      rule[searchField].includes(searchText)
    );
    setRules(filteredRules);
  };

  const addRule = () => {
    // 创建一个新的规则对象，确保key和id是唯一的
    const newRule = {
      key: '',
      id: '',
      scenario: '', // 默认为空，待用户填写
      role: '', // 默认为空，待用户填写
      action: '', // 默认为空，待用户填写
      type: '', // 默认为空，待用户填写
      condition1: '', // 默认为空，待用户填写
      condition2: '', // 默认为空，待用户填写
      content1: '',
      content2: '',
    };
    setCurrentRule(newRule);
    form.setFieldsValue(newRule);
    setIsModalVisible(true);
    setIsEditing(true); // 标记为编辑状态，这样表单字段就是可编辑的
    setIsAdding(true);
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
    { title: '更新时间', dataIndex: 'date', key: 'date' },
    { title: '操作', key: 'action', render: (text, record) => (
      <>
        <Button type="link" onClick={() => showModal(record)}>查看</Button>
        <Button type="link" onClick={() => update(record)}>更新</Button>
        <Button type="link" onClick={() => handleDelete(record)}>删除</Button>
      </>
    ) },
  ];

  return (
    <Card title={
      <div style={{ backgroundColor: '#f0f0f0', fontSize: '40px', textAlign: 'center' }}>
        行为规则模型管理
        <SettingOutlined style={{ marginLeft: 8 }} /> {/* 功能图标 */}
      </div>} bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
        <Select.Option value="id">行为规则ID</Select.Option>
        <Select.Option value="scenario">想定场景</Select.Option>
        <Select.Option value="role">智能体角色</Select.Option>
        <Select.Option value="action">动作</Select.Option>
        <Select.Option value="type">行为规则类型</Select.Option>
        {/* 添加其他搜索条件 */}
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>搜索</Button>
      <Table columns={columns} dataSource={rules} />
      <Modal
        title={
          isAdding 
            ? "增加模型"
            : isEditing 
              ? "更新模型" 
              : "模型详情"
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} initialValues={currentRule} onFinish={handleFinish}>
          {currentRule && (
            <>
              <Form.Item label="序号" name="key">
                <Input disabled />
              </Form.Item>
              <Form.Item label="行为规则ID" name="id">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="想定场景" name="scenario">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="智能体角色" name="role">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="动作" name="action">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="行为规则类型" name="type">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="条件1" name="condition1">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="条件2" name="condition2">
                <Input disabled={!isEditing} />
              </Form.Item>
              <Form.Item label="内容1" name="content1">
                <Input disabled={!isEditing}/>
              </Form.Item>
              <Form.Item label="内容2" name="content2">
                <Input disabled={!isEditing}/>
              </Form.Item>
              {!isAdding && !isEditing ? (
                <Form.Item label="更新时间" name="date">
                  <Input disabled={!isEditing} />
                </Form.Item>
              ) : null}
            </>
          )}  
        </Form>
      </Modal>
      <Button type="primary" onClick={addRule} style={{ marginBottom: 20 }}>
        <PlusOutlined /> 新增行为准则
      </Button>
    </Card>
  );
};

export default BehaviorLibrary;