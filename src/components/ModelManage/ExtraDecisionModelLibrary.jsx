import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ExtraDecisionModelLibrary = ({ decisions, fetchDecisions }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('algorithm id'); 
    const [filteredDecisions, setFilteredDecisions] = useState([]);
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];

  
    const mapExtraDecisionData = (decision, index) => ({
        key: decision['algorithm id'] || `fallback-${index}`, 
        ALGORITHM_ID: decision['algorithm id'],
        ALGORITHM_NAME: decision.algorithm_name,
        ALGORITHM_TYPE: decision['algorithm type'],
        DESCRIPTION: decision.description,
        ALGORITHM_IMAGE: decision.algorithm_image,
        MODEL_PATH: decision.model_path,
        CREATE_TIME: decision.create_time,
        rawData: decision 
    });

    useEffect(() => {
        if (decisions && Array.isArray(decisions)) {
            setFilteredDecisions(decisions.map((decision, index) => mapExtraDecisionData(decision, index)));
        } else {
            setFilteredDecisions([]);
        }
    }, [decisions]);

    useEffect(() => {
        if (currentDecision) {
            editForm.setFieldsValue({
                ALGORITHM_ID: currentDecision.ALGORITHM_ID,
                ALGORITHM_NAME: currentDecision.ALGORITHM_NAME,
                ALGORITHM_TYPE: currentDecision.ALGORITHM_TYPE,
                DESCRIPTION: currentDecision.DESCRIPTION,
                ALGORITHM_IMAGE: currentDecision.ALGORITHM_IMAGE,
                MODEL_PATH: currentDecision.MODEL_PATH,
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
                body: JSON.stringify({ type: 'extraDecision', id }), 
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('额外决策模型删除成功');
                fetchDecisions();
            }
        } catch (error) {
            console.error('Error deleting extra decision model:', error);
            message.error('额外决策模型删除失败');
        }
    };

    const handleUpdate = async (id, values) => {
        try {
            const updatedData = {
                "algorithm id": values.ALGORITHM_ID,
                "algorithm_name": values.ALGORITHM_NAME,
                "algorithm type": values.ALGORITHM_TYPE,
                "description": values.DESCRIPTION,
                "algorithm_image": values.ALGORITHM_IMAGE,
                "model_path": values.MODEL_PATH,
                "create_time": values.CREATE_TIME
            };

            const response = await fetch(__APP_CONFIG__.updateAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'extraDecision', 
                    id,
                    data: updatedData
                }),
            });
            const result = await response.json();
            if (result.status === 'success') {
                message.success('额外决策模型更新成功');
                fetchDecisions();
                setIsEditModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating extra decision model:', error);
            message.error('额外决策模型更新失败');
        }
    };

    const handleSearch = async () => {
        try {
            const response = await fetch(__APP_CONFIG__.searchAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'extraDecision', 
                    field: searchField,
                    value: searchText
                })
            });

            const result = await response.json();
            if (Array.isArray(result)) {
                setFilteredDecisions(result.map((decision, index) => mapExtraDecisionData(decision, index)));
            } else {
                console.error('Expected an array but got:', result);
                setFilteredDecisions([]);
            }
        } catch (error) {
            console.error('Error searching extra decision models:', error);
            message.error('额外决策模型搜索失败');
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
        await handleUpdate(currentDecision.ALGORITHM_ID, values);
    };

    const handleAdd = async (values) => {
        try {
            const newData = {
                "algorithm id": values.ALGORITHM_ID,
                "algorithm_name": values.ALGORITHM_NAME,
                "algorithm type": values.ALGORITHM_TYPE,
                "description": values.DESCRIPTION,
                "algorithm_image": values.ALGORITHM_IMAGE,
                "model_path": values.MODEL_PATH,
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
                message.success('额外决策模型新增成功');
                fetchDecisions();
                setIsAddModalVisible(false);
            }
        } catch (error) {
            console.error('Error adding extra decision model:', error);
            message.error('额外决策模型新增失败');
        }
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'index', render: (text, record, index) => index + 1 },
        { title: '算法 ID', dataIndex: 'ALGORITHM_ID', key: 'ALGORITHM_ID' },
        { title: '算法名称', dataIndex: 'ALGORITHM_NAME', key: 'ALGORITHM_NAME' },
        { title: '算法类型', dataIndex: 'ALGORITHM_TYPE', key: 'ALGORITHM_TYPE' },
        { title: '描述', dataIndex: 'DESCRIPTION', key: 'DESCRIPTION' },
        { title: '算法图片', dataIndex: 'ALGORITHM_IMAGE', key: 'ALGORITHM_IMAGE' },
        { title: '模型路径', dataIndex: 'MODEL_PATH', key: 'MODEL_PATH' },
        { title: '创建时间', dataIndex: 'CREATE_TIME', key: 'CREATE_TIME' },
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(false); setIsEditModalVisible(true); }}>查看</Button>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(true); setIsEditModalVisible(true); editForm.setFieldsValue(record); }}>更新</Button>
                    <Button type="link" onClick={() => handleDelete(record.ALGORITHM_ID)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="额外决策模型库" bordered={true}>
            <span>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
                <Select.Option value="algorithm id">算法 ID</Select.Option>
                <Select.Option value="algorithm_name">算法名称</Select.Option>
                <Select.Option value="algorithm type">算法类型</Select.Option>
                <Select.Option value="description">描述</Select.Option>
                <Select.Option value="algorithm_image">算法图片</Select.Option>
                <Select.Option value="model_path">模型路径</Select.Option>
                <Select.Option value="create_time">创建时间</Select.Option>
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 }} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Table
                dataSource={filteredDecisions}
                columns={columns}
                rowKey="key" 
            />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑额外决策模型' : '查看额外决策模型'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentDecision} onFinish={handleFinishEdit}>
                    <Form.Item label="算法 ID" name="ALGORITHM_ID">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="算法名称" name="ALGORITHM_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="算法类型" name="ALGORITHM_TYPE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="描述" name="DESCRIPTION">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="算法图片" name="ALGORITHM_IMAGE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    {!isEditMode && currentDecision?.ALGORITHM_IMAGE && (
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}> {/* Adjust offset/span as needed for alignment */}
                            <img
                                src={currentDecision.ALGORITHM_IMAGE}
                                alt="算法图片"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '10px' }}
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "https://placehold.co/150x100/CCCCCC/FFFFFF?text=图片加载失败"; // Placeholder image
                                    message.error('图片加载失败');
                                }}
                            />
                        </Form.Item>
                    )}
                    <Form.Item label="模型路径" name="MODEL_PATH">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 新增额外决策模型的模态框 */}
            <Modal
                title="新增额外决策模型"
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
                    <Form.Item label="模型路径" name="MODEL_PATH" rules={[{ required: true, message: '请输入模型路径' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} value={new Date().toISOString()} />
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
                新增额外决策模型
            </Button>
        </Card>
    );
};

export default ExtraDecisionModelLibrary;