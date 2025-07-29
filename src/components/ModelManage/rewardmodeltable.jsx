import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const RewardModelLibrary = ({ decisions, fetchDecisions }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    // const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('id'); 
    const [filteredDecisions, setFilteredDecisions] = useState(decisions||[]);
    const editForm = Form.useForm()[0];
    // const addForm = Form.useForm()[0];

  
    const mapRewardModelData = (decision, index) => ({
        key: decision['id'] || `fallback-${index}`, 
        ID: decision['id'],
        REWARDS_PATH: decision.REWARDS_PATH,
        DATA_PATH: decision.DATA_PATH,
        CREATE_TIME: decision.CREATE_TIME,
        rawData: decision 
    });

    useEffect(() => {
        if (decisions && Array.isArray(decisions)) {
            setFilteredDecisions(decisions.map((decision, index) => mapRewardModelData(decision, index)));
        } else {
            setFilteredDecisions([]);
        }
    }, [decisions]);

    useEffect(() => {
        if (currentDecision) {
            editForm.setFieldsValue({
                ID: currentDecision.ID,
                DATA_PATH: currentDecision.DATA_PATH,
                REWARDS_PATH: currentDecision.REWARDS_PATH,
                CREATE_TIME: currentDecision.CREATE_TIME
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
                body: JSON.stringify({ type: 'reward', id }), 
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('奖励模型删除成功');
                fetchDecisions();
            }
        } catch (error) {
            console.error('Error deleting reward model:', error);
            message.error('奖励模型删除失败');
        }
    };

    const handleUpdate = async (id, values) => {
        try {
            const updatedData = {
                "id": values.ID,
                "REWARDS_PATH": values.REWARDS_PATH,
                "data_path": values.DATA_PATH,
                "create_time": values.CREATE_TIME
            };

            const response = await fetch(__APP_CONFIG__.updateAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'rewards', 
                    id,
                    data: updatedData
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('奖励模型更新成功');
                fetchDecisions();
                setIsEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating extra decision model:', error);
            message.error('奖励模型更新失败');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(__APP_CONFIG__.searchAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'rewards', 
                    field: searchField,
                    value: searchText
                })
            });

            const result = await response.json();
            if (Array.isArray(result)) {
                setFilteredDecisions(result.map((decision, index) => mapRewardModelData(decision, index)));
            } else {
                console.error('Expected an array but got:', result);
                setFilteredDecisions([]);
            }
        } catch (error) {
            console.error('Error searching extra decision models:', error);
            message.error('奖励模型搜索失败');
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
        await handleUpdate(currentDecision.ID, values);
    };

    const handleAdd = async (values) => {
        try {
            const newData = {
                "id": values.ID,
                "REWARDS_PATH": values.REWARDS_PATH,
                "data_path": values.DATA_PATH,
                "create_time": values.CREATE_TIME || new Date().toISOString()
            };

            const response = await fetch(__APP_CONFIG__.addAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'extraDecision', 
                    data: newData
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('奖励模型新增成功');
                fetchDecisions();
                setIsAddModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding extra decision model:', error);
            message.error('奖励模型新增失败');
        }
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'index', render: (text, record, index) => index + 1 },
        { title: 'ID', dataIndex: 'ID', key: 'ID' },
        { title: '模型路径', dataIndex: 'REWARDS_PATH', key: 'REWARDS_PATH' },
        { title: '数据路径', dataIndex: 'DATA_PATH', key: 'DATA_PATH' },
        { title: '创建时间', dataIndex: 'CREATE_TIME', key: 'CREATE_TIME' },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(false); setIsEditModalVisible(true); }}>查看</Button>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(true); setIsEditModalVisible(true); editForm.setFieldsValue(record); }}>更新</Button>
                    <Button type="link" onClick={() => handleDelete(record.ID)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="奖励模型库" bordered={true}>
            <span style={{color:'white'}}>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 200, marginRight: 8 }}>
                <Select.Option value="id">ID</Select.Option>
                {/* <Select.Option value="REWARDS_PATH">模型路径</Select.Option>
                <Select.Option value="data_path">数据路径</Select.Option>
                <Select.Option value="create_time">创建时间</Select.Option> */}
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 ,marginBottom: 18}} />
            <Button onClick={handleSearch}>搜索</Button>
            <Table
                dataSource={filteredDecisions}
                columns={columns}
                rowKey="key" 
            />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑奖励模型' : '查看奖励模型'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentDecision} onFinish={handleFinishEdit}>
                    <Form.Item label="ID" name="ID">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="模型路径" name="REWARDS_PATH">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="数据路径" name="DATA_PATH">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 新增奖励模型的模态框 */}
            {/* <Modal
                title="新增奖励模型"
                open={isAddModalVisible}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalVisible(false)}
            >
                <Form form={addForm} onFinish={handleAdd}>
                    <Form.Item label="算法 ID" name="ALGORITHM_ID" rules={[{ required: true, message: '请输入算法 ID' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="算法名称" name="ALGORITHM_NAME" rules={[{ required: true, message: '请输入算法名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="算法类型" name="ALGORITHM_TYPE" rules={[{ required: true, message: '请输入算法类型' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="描述" name="DESCRIPTION">
                        <Input />
                    </Form.Item>
                    <Form.Item label="算法图片" name="ALGORITHM_IMAGE">
                        <Input />
                    </Form.Item>
                    <Form.Item label="模型路径" name="REWARDS_PATH" rules={[{ required: true, message: '请输入模型路径' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} value={new Date().toISOString()} />
                    </Form.Item>
                </Form>
            </Modal> */}

            {/* <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                    setIsAddModalVisible(true);
                    addForm.resetFields();
                }}
            >
                新增奖励模型
            </Button> */}
        </Card>
    );
};

export default RewardModelLibrary;