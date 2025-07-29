import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const DecisionModelLibrary = ({ decisions, fetchDecisions }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('');
    const [filteredDecisions, setFilteredDecisions] = useState([]);
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];

    // Map nested decision data to flat structure for table and forms
    const mapDecisionData = (decision, index) => ({
        key: decision.model.id || `fallback-${index}`, // Ensure unique key
        AGENT_MODEL_ID: decision.model.id,
        AGENT_NAME: decision.model.name,
        AGENT_ID:decision.model.agentID,
        SCENARIO_NAME: decision.model.scenario_name,
        ROLE_NAME: decision.model.role_name,
        NN_MODEL_TYPE: decision.model.nn_model_type,
        MODEL_PATH: decision.model.model_path,
        MODEL_LIST: decision.model.model_list,
        IMG_URL: decision.model.img_url,
        CREAT_TIME: decision.model.time,
        rawData: decision // Store raw data for editing
    });

    useEffect(() => {
        if (decisions && Array.isArray(decisions)) {
            // Map decisions and ensure unique keys
            setFilteredDecisions(decisions.map((decision, index) => mapDecisionData(decision, index)));
        } else {
            setFilteredDecisions([]);
        }
    }, [decisions]);

    useEffect(() => {
        if (currentDecision) {
            editForm.setFieldsValue({
                AGENT_MODEL_ID: currentDecision.AGENT_MODEL_ID,
                AGENT_NAME: currentDecision.AGENT_NAME,
                AGENT_ID:currentDecision.AGENT_ID,
                SCENARIO_NAME: currentDecision.SCENARIO_NAME,
                ROLE_NAME: currentDecision.ROLE_NAME,
                NN_MODEL_TYPE: currentDecision.NN_MODEL_TYPE,
                MODEL_PATH: currentDecision.MODEL_PATH,
                MODEL_LIST: currentDecision.MODEL_LIST,
                IMG_URL: currentDecision.IMG_URL,
                CREAT_TIME: currentDecision.CREAT_TIME
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
                body: JSON.stringify({ type: 'decision', id }),
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
            // Construct nested structure for update
            console.log(currentDecision)
            const updatedData = {
                model: {
                    id: values.AGENT_MODEL_ID,
                    name: values.AGENT_NAME,
                    type: values.NN_MODEL_TYPE,
                    path: values.MODEL_PATH,
                    img_url: values.IMG_URL,
                    time: new Date().toISOString(),
                    version: currentDecision.rawData.model.version,
                    state: currentDecision.rawData.model.state,
                    model_list: currentDecision.rawData.model.model_list
                },
                scenario: {
                    name: values.SCENARIO_NAME,
                    // description: currentDecision.rawData.scenario.description,
                    envParams: currentDecision.rawData.envParams
                },
                agent: {
                    role: values.ROLE_NAME,
                    // type: currentDecision.rawData.agent.type,
                    // count: currentDecision.rawData.agent.count,
                    // entityAssignments: currentDecision.rawData.agent.entityAssignments
                },
                // train: currentDecision.rawData.train
            };

            const response = await fetch(__APP_CONFIG__.updateAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'decision',
                    id,
                    data: updatedData
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'decision',
                    field: searchField,
                    value: searchText
                })
            });

            const result = await response.json();
            if (Array.isArray(result)) {
                setFilteredDecisions(result.map((decision, index) => mapDecisionData(decision, index)));
            } else {
                console.error('Expected an array but got:', result);
                setFilteredDecisions([]);
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
            // Construct nested structure for new model
            const newData = {
                model: {
                    id: values.AGENT_MODEL_ID,
                
                    name: values.AGENT_NAME,
                    version: '1',
                    type: values.NN_MODEL_TYPE,
                    time: new Date().toISOString(),
                    state: '未发布',
                    img_url: values.IMG_URL,
                    path: values.MODEL_PATH,
                    model_list: [`${values.AGENT_MODEL_ID}-0`, `${values.AGENT_MODEL_ID}-20`]
                },
                scenario: {
                    name: values.SCENARIO_NAME,
                    description: '默认场景描述',
                    envParams: []
                },
                agent: {
                    role: values.ROLE_NAME,
                    type: values.NN_MODEL_TYPE,
                    count: '1',
                    entityAssignments: []
                },
                train: {
                    algorithm: 'Unknown',
                    hyperParams: []
                }
            };

            const response = await fetch(__APP_CONFIG__.addAll, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'decision',
                    data: newData
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
            message.error('决策模型新增失败'); // Fixed typo in error message
        }
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'index', render: (text, record, index) => index + 1 },
        { title: '决策模型训练 ID', dataIndex: 'AGENT_MODEL_ID', key: 'AGENT_MODEL_ID' },
        { title: '智能体ID', dataIndex: 'AGENT_ID', key: 'AGENT_ID' },
        { title: '智能体模型名称', dataIndex: 'AGENT_NAME', key: 'AGENT_NAME' },
        { title: '所属想定场景名称', dataIndex: 'SCENARIO_NAME', key: 'SCENARIO_NAME' },
        { title: '角色名称', dataIndex: 'ROLE_NAME', key: 'ROLE_NAME' },
        { title: '神经网络模型类型', dataIndex: 'NN_MODEL_TYPE', key: 'NN_MODEL_TYPE' },
        { title: '模型', dataIndex: 'MODEL_LIST', key: 'MODEL_LIST' },
        { title: '图片链接', dataIndex: 'IMG_URL', key: 'IMG_URL' },
        { title: '创建时间', dataIndex: 'CREAT_TIME', key: 'CREAT_TIME' ,render: time => new Date(time).toLocaleString()},
        {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(false); setIsEditModalVisible(true); }}>查看</Button>
                    <Button type="link" onClick={() => { setCurrentDecision(record); setIsEditMode(true); setIsEditModalVisible(true); editForm.setFieldsValue(record); }}>更新</Button>
                    <Button type="link" onClick={() => handleDelete(record.AGENT_MODEL_ID)}>删除</Button>
                </div>
            ),
        },
    ];

    return (
        <Card title="决策模型库" bordered={true}>
            <span>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 200, marginRight: 8 }}>
                <Select.Option value="train_id">决策模型训练 ID</Select.Option>
                <Select.Option value="name">智能体模型名称</Select.Option>
                <Select.Option value="id">智能体ID</Select.Option>
                <Select.Option value="scenario_name">所属想定场景名称</Select.Option>
                <Select.Option value="role_name">角色名称</Select.Option>
                <Select.Option value="nn_model_type">神经网络模型类型</Select.Option>
                {/* <Select.Option value="model.path">模型路径</Select.Option>
                <Select.Option value="model.img_url">图片链接</Select.Option>
                <Select.Option value="model.time">创建时间</Select.Option> */}
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8 }} />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Table
                dataSource={filteredDecisions}
                columns={columns}
                rowKey="key" // Use 'key' as the unique identifier
            />

            {/* 编辑和查看的模态框 */}
            <Modal
                title={isEditMode ? '编辑决策模型' : '查看决策模型'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
            >
                <Form form={editForm} initialValues={currentDecision} onFinish={handleFinishEdit}>
                    <Form.Item label="决策模型训练 ID" name="AGENT_MODEL_ID">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="智能体ID" name="AGENT_ID">
                        <Input disabled={true} />
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
                    <Form.Item label="模型" name="MODEL_PATH">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="图片链接" name="IMG_URL">
                        <Input disabled={true} />
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
                    <Form.Item label="决策模型 ID" name="AGENT_MODEL_ID" rules={[{ required: true, message: '请输入决策模型 ID' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="智能体ID" name="AGENT_ID" rules={[{ required: true, message: '请输入智能体 ID' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="智能体模型名称" name="AGENT_NAME" rules={[{ required: true, message: '请输入智能体模型名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="所属想定场景名称" name="SCENARIO_NAME" rules={[{ required: true, message: '请输入场景名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="角色名称" name="ROLE_NAME" rules={[{ required: true, message: '请输入角色名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="神经网络模型类型" name="NN_MODEL_TYPE" rules={[{ required: true, message: '请输入模型类型' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="模型路径" name="MODEL_PATH" rules={[{ required: true, message: '请输入模型路径' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="图片链接" name="IMG_URL">
                        <Input />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREAT_TIME">
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
                新增决策模型
            </Button>
        </Card>
    );
};

export default DecisionModelLibrary;