import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const DecisionModelLibrary = ({ decisions, fetchDecisions }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('AGENT_MODEL_ID');
    const [filteredDecisions, setFilteredDecisions] = useState(decisions || []);
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];

    useEffect(() => {
        if (decisions) {
            setFilteredDecisions(decisions);
        }
    }, [decisions]);

    useEffect(() => {
        if (currentDecision) {
            editForm.setFieldsValue({
                ...currentDecision,
                CREAT_TIME: currentDecision.CREAT_TIME || new Date().toISOString() // 确保有默认值
            });
        } else {
            editForm.resetFields();
        }
    }, [currentDecision, editForm]);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(__APP_CONFIG__.deleteAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'decision', id: id }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('决策模型删除成功');
                fetchDecisions();
            }
        } catch (error) {
            console.error('Error deleting decision model:', error);
            message.error('决策模型删除失败');
        }
    };

    const handleUpdate = async (id, values) => {
        try {
            const response = await fetch(__APP_CONFIG__.updateDecisionModel, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'decision',
                    id: id,
                    data: { ...values, CREAT_TIME: new Date().toISOString() } // 添加当前时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('决策模型更新成功');
                fetchDecisions();
                setIsEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating decision model:', error);
            message.error('决策模型更新失败');
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
                  type: 'decision', // 根据页面类型传入不同的 type
                  field: searchField,
                  value: searchText
              })
          });
  
          const result = await response.json();
          if (Array.isArray(result)) {
              setFilteredDecisions(result); // 假设你使用 setFilteredDecisions 来更新状态
          } else {
              console.error('Expected an array but got:', result);
              setFilteredDecisions([]); // 如果返回的不是数组，设置为空数组
          }
      } catch (error) {
          console.error('Error searching decision models:', error);
          message.error('决策模型搜索失败');
      }
  };

    const handleOkEdit = () => {
        if (isEditMode) {
            editForm.submit();
        } else {
            setIsEditModalVisible(false);
        }
    };

    const handleFinishEdit = async (values) => {
        await handleUpdate(currentDecision.AGENT_MODEL_ID, values);
    };

    const handleAdd = async (values) => {
        try {
            const response = await fetch(__APP_CONFIG__.addDecisionModel, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'decision',
                    data: { ...values, CREAT_TIME: new Date().toISOString() } // 添加当前时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('决策模型新增成功');
                fetchDecisions();
                setIsAddModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding decision model:', error);
            message.error('决策模型新增失败');
        }
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'key', render: (text, record, index) => index + 1 },
        { title: '智能体模型 ID', dataIndex: 'AGENT_MODEL_ID', key: 'AGENT_MODEL_ID' },
        { title: '智能体模型名称', dataIndex: 'AGENT_NAME', key: 'AGENT_NAME' },
        { title: '所属想定场景名称', dataIndex: 'SCENARIO_NAME', key: 'SCENARIO_NAME' },
        { title: '角色名称', dataIndex: 'ROLE_NAME', key: 'ROLE_NAME' },
        { title: '神经网络模型类型', dataIndex: 'NN_MODEL_TYPE', key: 'NN_MODEL_TYPE' },
        { title: '模型路径', dataIndex: 'MODEL_PATH', key: 'MODEL_PATH' },
        { title: '图片链接', dataIndex: 'IMG_URL', key: 'IMG_URL' },
        { title: '创建时间', dataIndex: 'CREAT_TIME', key: 'CREAT_TIME' },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(false); setIsEditModalVisible(true); }}>查看</Button>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(true); setIsEditModalVisible(true); editForm.setFieldsValue(record); }}>编辑</Button>
                    <Button type="link" onClick={() => handleDelete(record.AGENT_MODEL_ID)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="决策模型库" bordered={true}>
            <span>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
                <Select.Option value="AGENT_MODEL_ID">智能体模型 ID</Select.Option>
                <Select.Option value="AGENT_NAME">智能体模型名称</Select.Option>
                <Select.Option value="SCENARIO_NAME">所属想定场景名称</Select.Option>
                <Select.Option value="ROLE_NAME">角色名称</Select.Option>
                <Select.Option value="NN_MODEL_TYPE">神经网络模型类型</Select.Option>
                <Select.Option value="MODEL_PATH">模型路径</Select.Option>
                <Select.Option value="IMG_URL">图片链接</Select.Option>
                <Select.Option value="CREAT_TIME">创建时间</Select.Option>
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 }} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Table dataSource={filteredDecisions} columns={columns} rowKey="AGENT_MODEL_ID" />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑决策模型' : '查看决策模型'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentDecision} onFinish={handleFinishEdit}>
                    <Form.Item label="智能体模型 ID" name="AGENT_MODEL_ID">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="智能体模型名称" name="AGENT_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="所属想定场景名称" name="SCENARIO_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="角色名称" name="ROLE_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="神经网络模型类型" name="NN_MODEL_TYPE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="模型路径" name="MODEL_PATH">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="图片链接" name="IMG_URL">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREAT_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 新增决策模型的模态框 */}
            <Modal
                title="新增决策模型"
                open={isAddModalVisible}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <Form form={addForm} onFinish={handleAdd}>
                    <Form.Item label="智能体模型 ID" name="AGENT_MODEL_ID">
                        <Input />
                    </Form.Item>
                    <Form.Item label="智能体模型名称" name="AGENT_NAME">
                        <Input />
                    </Form.Item>
                    <Form.Item label="所属想定场景名称" name="SCENARIO_NAME">
                        <Input />
                    </Form.Item>
                    <Form.Item label="角色名称" name="ROLE_NAME">
                        <Input />
                    </Form.Item>
                    <Form.Item label="神经网络模型类型" name="NN_MODEL_TYPE">
                        <Input />
                    </Form.Item>
                    <Form.Item label="模型路径" name="MODEL_PATH">
                        <Input />
                    </Form.Item>
                    <Form.Item label="图片链接" name="IMG_URL">
                        <Input />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREAT_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                </Form>
            </Modal>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                    setIsAddModalVisible(true);
                    addForm.resetFields();
                }}
            >
                新增决策模型
            </Button>
        </Card>
    );
};

export default DecisionModelLibrary;