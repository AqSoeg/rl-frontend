import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const OfflineDatabase = ({ datasets, fetchDatasets }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDataset, setCurrentDataset] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('OFFLINE_DATA_ID');
    const [filteredDatasets, setFilteredDatasets] = useState(datasets || []);
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];

    useEffect(() => {
        if (datasets) {
            setFilteredDatasets(datasets);
        }
    }, [datasets]);

    useEffect(() => {
        if (currentDataset) {
            editForm.setFieldsValue(currentDataset);
        } else {
            editForm.resetFields();
        }
    }, [currentDataset, editForm]);

    const handleDelete = async (id) => {
        try {
            const response = await fetch(__APP_CONFIG__.deleteAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'dataset', id: id }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('数据集删除成功');
                fetchDatasets();
            }
        } catch (error) {
            console.error('Error deleting dataset:', error);
            message.error('数据集删除失败');
        }
    };

    const handleUpdate = async (id, values) => {
        try {
            const response = await fetch(__APP_CONFIG__.updateAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'dataset',
                    id: id,
                    data: { ...values, CREAT_TIME: new Date().toISOString() } // 添加当前时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('数据集更新成功');
                fetchDatasets();
                setIsEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating dataset:', error);
            message.error('数据集更新失败');
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
                    type: 'dataset',
                    field: searchField,
                    value: searchText
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setFilteredDatasets(result);
        } catch (error) {
            console.error('Error searching datasets:', error);
            message.error('数据集搜索失败');
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
        await handleUpdate(currentDataset.OFFLINE_DATA_ID, values);
    };

    const handleAdd = async (values) => {
        try {
            const response = await fetch(__APP_CONFIG__.addAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'dataset',
                    data: { ...values, CREAT_TIME: new Date().toISOString() } // 添加当前时间
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('数据集新增成功');
                fetchDatasets();
                setIsAddModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding dataset:', error);
            message.error('数据集新增失败');
        }
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'key', render: (text, record, index) => index + 1 },
        { title: '离线数据集 ID', dataIndex: 'OFFLINE_DATA_ID', key: 'OFFLINE_DATA_ID' },
        { title: '数据集名称', dataIndex: 'DATASET_NAME', key: 'DATASET_NAME' },
        { title: '所属想定场景名称', dataIndex: 'SCENARIO_NAME', key: 'SCENARIO_NAME' },
        { title: '数据所属智能体角色', dataIndex: 'AGENT_ROLE', key: 'AGENT_ROLE' },
        { title: '离线数据中的状态信息', dataIndex: 'DATA_STATE', key: 'DATA_STATE' },
        { title: '离线数据中的动作信息描述', dataIndex: 'DATA_ACTION', key: 'DATA_ACTION' },
        { title: '数据库文件路径', dataIndex: 'DATASET_PATH', key: 'DATASET_PATH' },
        { title: '创建时间', dataIndex: 'CREATE_TIME', key: 'CREATE_TIME',render: time => new Date(time).toLocaleString() },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => {
                        setCurrentDataset(record);
                        setIsEditMode(false);
                        setIsEditModalVisible(true);
                    }}>查看</Button>
                    <Button type="link" onClick={() => {
                        setCurrentDataset(record);
                        setIsEditMode(true);
                        setIsEditModalVisible(true);
                        editForm.setFieldsValue(record);
                    }}>更新</Button>
                    <Button type="link" onClick={() => handleDelete(record.OFFLINE_DATA_ID)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="离线数据集库" bordered={true}>
            <span>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 200, marginRight: 8 }}>
                <Select.Option value="OFFLINE_DATA_ID">离线数据集 ID</Select.Option>
                <Select.Option value="DATASET_NAME">数据集名称</Select.Option>
                <Select.Option value="SCENARIO_NAME">所属想定场景名称</Select.Option>
                <Select.Option value="AGENT_ROLE">数据所属智能体角色</Select.Option>
                {/* <Select.Option value="DATA_STATE">离线数据中的状态信息</Select.Option>
                <Select.Option value="DATA_ACTION">离线数据中的动作信息描述</Select.Option>
                <Select.Option value="DATASET_PATH">数据库文件路径</Select.Option>
                <Select.Option value="CREAT_TIME">创建时间</Select.Option> */}
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 }} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Table dataSource={filteredDatasets} columns={columns} rowKey="OFFLINE_DATA_ID" />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑数据集' : '查看数据集'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentDataset} onFinish={handleFinishEdit}>
                    <Form.Item label="离线数据集 ID" name="OFFLINE_DATA_ID">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="数据集名称" name="DATASET_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="所属想定场景名称" name="SCENARIO_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="数据所属智能体角色" name="AGENT_ROLE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="离线数据中的状态信息" name="DATA_STATE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="离线数据中的动作信息描述" name="DATA_ACTION">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="数据库文件路径" name="DATASET_PATH">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} /> {/* 创建时间字段不可编辑 */}
                    </Form.Item>
                </Form>
            </Modal>

            {/* 新增数据集的模态框 */}
            <Modal
                title="新增数据集"
                open={isAddModalVisible}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <Form form={addForm} onFinish={handleAdd}>
                    <Form.Item label="离线数据集 ID" name="OFFLINE_DATA_ID">
                        <Input />
                    </Form.Item>
                    <Form.Item label="数据集名称" name="DATASET_NAME">
                        <Input />
                    </Form.Item>
                    <Form.Item label="所属想定场景名称" name="SCENARIO_NAME">
                        <Input />
                    </Form.Item>
                    <Form.Item label="数据所属智能体角色" name="AGENT_ROLE">
                        <Input />
                    </Form.Item>
                    <Form.Item label="离线数据中的状态信息" name="DATA_STATE">
                        <Input />
                    </Form.Item>
                    <Form.Item label="离线数据中的动作信息描述" name="DATA_ACTION">
                        <Input />
                    </Form.Item>
                    <Form.Item label="数据库文件路径" name="DATASET_PATH">
                        <Input />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREAT_TIME">
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
                新增数据集
            </Button>
        </Card>
    );
};

export default OfflineDatabase;