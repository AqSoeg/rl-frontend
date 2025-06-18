import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ScenarioLibrary = ({ scenarios, fetchScenarios }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('id');
    const [filteredScenarios, setFilteredScenarios] = useState(scenarios || []);
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];

    useEffect(() => {
        if (scenarios) {
            setFilteredScenarios(scenarios);
        }
    }, [scenarios]);

    useEffect(() => {
        if (currentScenario) {
            editForm.setFieldsValue(currentScenario);
        } else {
            editForm.resetFields();
        }
    }, [currentScenario, editForm]);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(__APP_CONFIG__.deleteAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'scenario', id: id }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('想定场景删除成功');
                fetchScenarios(); // 重新获取数据
            }
        } catch (error) {
            console.error('Error deleting scenario:', error);
            message.error('想定场景删除失败');
        }
    };

    const handleUpdate = async (id, values) => {
        try {
            const response = await fetch(__APP_CONFIG__.updateAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'scenario',
                    id: id,
                    data: { ...values, updateTime: new Date().toISOString() } // 添加更新时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('想定场景更新成功');
                fetchScenarios(); // 重新获取数据
                setIsEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating scenario:', error);
            message.error('想定场景更新失败');
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
                    type: 'scenario',
                    field: searchField,
                    value: searchText
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setFilteredScenarios(result);
        } catch (error) {
            console.error('Error searching scenarios:', error);
            message.error('想定场景搜索失败');
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
        await handleUpdate(currentScenario.id, values);
    };

    const handleAdd = async (values) => {
        try {
            const response = await fetch(__APP_CONFIG__.addAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'scenario',
                    data: { ...values, createTime: new Date().toISOString() } // 添加创建时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('想定场景新增成功');
                fetchScenarios(); // 重新获取数据
                setIsAddModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding scenario:', error);
            message.error('想定场景新增失败');
        }
    };

    const columns = [
        { title: '想定场景 ID', dataIndex: 'id', key: 'id' },
        { title: '想定场景名称', dataIndex: 'name', key: 'name' },
        { title: '描述', dataIndex: 'description', key: 'description' },
        { title: '创建时间', dataIndex: 'createTime', key: 'createTime',render: time => new Date(time).toLocaleString() },
        {
            title: '角色列表',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles) => (
                <Text>
                    {roles?.map((role) => role.name).join('\n')}
                </Text>
            )
        },
        {
            title: '环境参数',
            dataIndex: 'env_params',
            key: 'env_params',
            render: (env_params) => (
                <Text>
                    {env_params?.map((param) => `${param.name}: ${param.params.map(p => p[1]).join(', ')}`).join('\n')}
                </Text>
            )
        },
        {
            title: '奖励函数',
            dataIndex: 'roles',
            key: 'rewardParams',
            render: (roles) => (
                <Text>
                    {roles?.map((role) => `${role.name}: ${role.RewardParams.map(rp => rp[0]).join(', ')}`).join('\n')}
                </Text>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => {
                        setCurrentScenario(record);
                        setIsEditMode(false);
                        setIsEditModalVisible(true);
                    }}>查看</Button>
                    <Button type="link" onClick={() => {
                        setCurrentScenario(record);
                        setIsEditMode(true);
                        setIsEditModalVisible(true);
                        editForm.setFieldsValue(record);
                    }}>更新</Button>
                    <Button type="link" onClick={() => handleDelete(record.id)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="想定场景库" bordered={true}>
            <span>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
                <Select.Option value="id">想定场景 ID</Select.Option>
                <Select.Option value="name">想定场景名称</Select.Option>
                <Select.Option value="description">描述</Select.Option>
                <Select.Option value="createTime">创建时间</Select.Option>
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 }} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Table dataSource={filteredScenarios} columns={columns} rowKey="id" />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑想定场景' : '查看想定场景'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentScenario} onFinish={handleFinishEdit}>
                    <Form.Item label="想定场景 ID" name="id">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="想定场景名称" name="name">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="createTime">
                        <Input disabled={true} /> {/* 创建时间字段不可编辑 */}
                    </Form.Item>
                </Form>
            </Modal>

            {/* 新增想定场景的模态框 */}
            <Modal
                title="新增想定场景"
                open={isAddModalVisible}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <Form form={addForm} onFinish={handleAdd}>
                    <Form.Item label="想定场景 ID" name="id">
                        <Input />
                    </Form.Item>
                    <Form.Item label="想定场景名称" name="name">
                        <Input />
                    </Form.Item>
                    <Form.Item label="描述" name="description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item label="创建时间" name="createTime">
                        <Input disabled={true} /> {/* 创建时间字段不可编辑 */}
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
                新增想定场景
            </Button>
        </Card>
    );
};

export default ScenarioLibrary;