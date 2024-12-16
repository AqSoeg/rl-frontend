import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';

const BehaviorLibrary = () => {
  const [rules, setRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]); // 新增状态用于存储过滤后的数据
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('id'); // 默认搜索字段
  const [isAdding, setIsAdding] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get('http://localhost:3000/agents');
        const rulesWithKey = response.data.map((rule, index) => ({
          ...rule,
          key: `${index + 1}`, // 确保 key 是字符串类型
        }));
        setRules(rulesWithKey);
        setFilteredRules(rulesWithKey); // 初始化过滤后的数据
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };
    fetchRules();
  }, []);

  const showModal = (rule) => {
    setCurrentRule(rule);
    form.setFieldsValue(rule);
    setIsModalVisible(true);
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleOk = () => {
    if (isEditing || isAdding) {
      form.submit();
    } else {
      setIsModalVisible(false);
    }
  };

  const handleFinish = (values) => {
    let updatedRules;
    if (isAdding) {
      // 添加新规则时，首先添加新规则，然后更新所有规则的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      const newRule = {
        ...values,
        key: `${rules.length + 1}`,
        id: values.id || `NEW-${Date.now()}`, // 如果没有提供ID，则使用时间戳生成一个临时ID
        date: now,
      };
      updatedRules = [...rules, newRule];
    } else {
      // 更新现有规则时，先更新对应的规则，然后更新所有规则的 key
      const now = moment().format('YYYY年MM月DD日 HH:mm:ss');
      updatedRules = rules.map(ruleItem =>
        ruleItem.key === currentRule.key ? { ...ruleItem, ...values, date: now } : ruleItem
      );
    }

    // 更新所有规则的 key 和 序号，以保持连续性
    updatedRules = updatedRules.map((rule, index) => ({
      ...rule,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));

    setRules(updatedRules); // 使用新的规则列表更新状态
    setFilteredRules(updatedRules); // 同步过滤后的数据
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
    let updatedRules = filteredRules.filter(m => m.key !== rule.key);
    // 更新所有规则的 key 和 序号，以保持连续性
    updatedRules = updatedRules.map((rule, index) => ({
      ...rule,
      key: `${index + 1}`, // 确保 key 是字符串类型
    }));
    setRules(updatedRules);
    setFilteredRules(updatedRules); // 同步过滤后的数据
  };

  const handleSearch = () => {
    const filteredRules = rules.filter(rule =>
      String(rule[searchField]).includes(searchText)
    );
    setFilteredRules(filteredRules);
  };

  const addRule = () => {
    // 创建一个新的规则对象，确保key和id是唯一的
    const newRule = {
      key: '',
      id: '',
      sceneId: '', // 默认为空，待用户填写
      agentRoleId: '', // 默认为空，待用户填写
      action: '', // 默认为空，待用户填写
      type: '', // 默认为空，待用户填写
      condition1: '', // 默认为空，待用户填写
      condition2: '', // 默认为空，待用户填写
      content1: '',
      content2: '',
      date: '', // 默认为空，将在保存时填充
    };
    setCurrentRule(newRule);
    form.setFieldsValue(newRule);
    setIsModalVisible(true);
    setIsEditing(true); // 标记为编辑状态，这样表单字段就是可编辑的
    setIsAdding(true);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => index + 1, // 动态计算序号
    },
    { title: '行为规则ID', dataIndex: 'id', key: 'id' },
    { title: '想定场景', dataIndex: 'sceneId', key: 'sceneId' },
    { title: '智能体角色', dataIndex: 'agentRoleId', key: 'agentRoleId' },
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
        <Select.Option value="sceneId">想定场景</Select.Option>
        <Select.Option value="agentRoleId">智能体角色</Select.Option>
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
      <Table columns={columns} dataSource={filteredRules} pagination={{ pageSize: 5 }} />
      <Modal
        title={
          isAdding 
            ? "增加行为准则"
            : isEditing 
              ? "更新行为准则" 
              : "行为准则详情"
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
                <Input disabled={!isEditing && !isAdding} />
              </Form.Item>
              <Form.Item label="想定场景" name="sceneId">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="智能体角色" name="agentRoleId">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="动作" name="action">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="行为规则类型" name="type">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="条件1" name="condition1">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="条件2" name="condition2">
                <Input disabled={!isEditing && !isAdding} />
              </Form.Item>
              <Form.Item label="内容1" name="content1">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              <Form.Item label="内容2" name="content2">
                <Input disabled={!isEditing && !isAdding}/>
              </Form.Item>
              {!isAdding && !isEditing ? (
                <Form.Item label="更新时间" name="date">
                  <Input disabled={!isEditing && !isAdding} />
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