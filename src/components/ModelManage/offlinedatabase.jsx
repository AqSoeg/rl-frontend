import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Card, Select } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import moment from 'moment';

const { Option } = Select;

const OfflineDatabase = () => {
  const [models, setModels] = useState([
    { key: '1', scenario: '场景1', role: '角色1', datasetId: 'DS-1', dataId: 'DS-1-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    { key: '2', scenario: '场景1', role: '角色2', datasetId: 'DS-2', dataId: 'DS-2-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    { key: '3', scenario: '场景2', role: '角色3', datasetId: 'DS-3', dataId: 'DS-3-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    // 更多数据...
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState(''); // 默认搜索字段
  const [form] = Form.useForm();


  const showModal = (model) => {
    setCurrentModel(model);
    form.setFieldsValue(model);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleDelete = (model) => {
    const updatedModels = models.filter(m => m.key !== model.key);
    setModels(updatedModels);
  };

  const handleSearch = () => {
    const filteredModels = models.filter(model =>
      model[searchField].includes(searchText)
    );
    setModels(filteredModels);
  };
  const columns = [
    { title: '序号', dataIndex: 'key', key: 'key' },
    { title: '想定场景', dataIndex: 'scenario', key: 'scenario' },
    { title: '智能体角色', dataIndex: 'role', key: 'role' },
    { title: '数据集ID', dataIndex: 'datasetId', key: 'datasetId' },
    { title: '数据ID', dataIndex: 'dataId', key: 'dataId' },
    { title: '当前时刻状态(S)', dataIndex: 'statusS', key: 'statusS' },
    { title: '当前时刻执行动作(A)', dataIndex: 'statusA', key: 'statusA' },
    { title: '当前时刻奖励(R)', dataIndex: 'statusR', key: 'statusR' },
    { title: '下一时刻状态(S_)', dataIndex: 'statusSJ', key: 'statusSJ' },
    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
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
        <Select.Option value="scenario">想定场景</Select.Option>
        <Select.Option value="role">智能体角色</Select.Option>
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
      <Table columns={columns} dataSource={models} />
      <Modal title="模型详情" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} initialValues={currentModel}>
          <Form.Item label="想定场景" name="scenario">
            <Input disabled />
          </Form.Item>
          <Form.Item label="智能体角色" name="role">
            <Input disabled />
          </Form.Item>
          <Form.Item label="数据集ID" name="datasetId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="数据ID" name="dataId">
            <Input disabled />
          </Form.Item>
          <Form.Item label="当前时刻状态(S)" name="statusS">
            <Input disabled />
          </Form.Item>
          <Form.Item label="当前时刻执行动作(A)" name="statusA">
            <Input disabled />
          </Form.Item>
          <Form.Item label="当前时刻奖励(R)" name="statusR">
            <Input disabled />
          </Form.Item>
          <Form.Item label="下一时刻状态(S_)" name="statusSJ">
            <Input disabled />
          </Form.Item>
          <Form.Item label="更新时间" name="updateTime">
            <Input disabled />
          </Form.Item>
        </Form>
      </Modal>
      <Link to="/智能体编辑" style={{ marginBottom: 20 }}>
        <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 20 }}>
          新增模型
        </Button>
      </Link>
    </Card>
  );
};;

export default OfflineDatabase;