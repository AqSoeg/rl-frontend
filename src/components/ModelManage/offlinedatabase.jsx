import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker } from 'antd';

const { Option } = Select;

const OfflineDatabase = () => {
  const [data, setData] = useState([
    { key: '1', scenario: '场景1', role: '角色1', datasetId: 'DS-1', dataId: 'DS-1-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    { key: '2', scenario: '场景1', role: '角色2', datasetId: 'DS-2', dataId: 'DS-2-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    { key: '3', scenario: '场景2', role: '角色3', datasetId: 'DS-3', dataId: 'DS-3-001', statusS: '...', statusA: '...', statusR: '...', statusSJ: '...', updateTime: '2024年9月1日 11:12:58' },
    // 更多数据...
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const showModal = (dataItem) => {
    setCurrentData(dataItem);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    // 更新数据的逻辑
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
    { title: '操作', key: 'action', render: () => (
      <>
        <Button type="link" onClick={() => showModal(data[0])}>查看</Button>
        <Button type="link">删除</Button>
      </>
    ) },
  ];

  return (
    <div>
      <h2>离线数据管理</h2>
      <Form>
        <Form.Item label="检索">
          <Select defaultValue="场景1" style={{ width: 120 }}>
            <Option value="场景1">场景1</Option>
            <Option value="场景2">场景2</Option>
          </Select>
          <Input placeholder="单行输入" style={{ width: 200, marginLeft: 8 }} />
          <Button type="primary" style={{ marginLeft: 8 }}>检索</Button>
        </Form.Item>
      </Form>
      <Table columns={columns} dataSource={data} />
      <Modal visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form>
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
    </div>
  );
};

export default OfflineDatabase;