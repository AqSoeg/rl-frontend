import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message, Spin, Tooltip } from 'antd';
import { SettingOutlined,PlusOutlined, EyeOutlined, DeleteOutlined, UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';

const ExtraDecisionModelLibrary = ({ decisions, fetchDecisions }) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [currentDecision, setCurrentDecision] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('algorithm_id');
    const [filteredDecisions, setFilteredDecisions] = useState([]);
    const [trainingLoading, setTrainingLoading] = useState({}); // Track loading state per record
    const editForm = Form.useForm()[0];
    const addForm = Form.useForm()[0];
    const fileInputRef = useRef(null);
    const jsonfileInputRef = useRef(null);
    const folderOutputRef = useRef(null);

    const formatDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    const mapExtraDecisionData = (decision, index) => ({
        key: decision['algorithm_id'] || `fallback-${index}`,
        ALGORITHM_ID: decision['algorithm_id'],
        ALGORITHM_NAME: decision.algorithm_name,
        ALGORITHM_TYPE: decision['algorithm_type'],
        DESCRIPTION: decision.description,
        ALGORITHM_IMAGE: decision.algorithm_image,
        MODEL_PATH: decision.model_path,
        CREATE_TIME: formatDate(decision.create_time),
        TRAINING_DATA_PATH: decision.training_data_path || '未选择',
        TRAINING_DATA_DESCRIPTION: decision.training_status || '',
        LAST_UPDATED_TIME: formatDate(decision.last_updated_time),
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
                CREATE_TIME: currentDecision.CREATE_TIME,
                TRAINING_DATA_PATH: currentDecision.TRAINING_DATA_PATH,
                TRAINING_DATA_DESCRIPTION: currentDecision.TRAINING_DATA_DESCRIPTION,
                LAST_UPDATED_TIME: currentDecision.LAST_UPDATED_TIME
            });
        } else {
            editForm.resetFields();
        }
    }, [currentDecision, editForm]);


    const handleDelete = async (id) => {
        try {
            const response = await fetch(__APP_CONFIG__.removeExtra, {
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
         console.log(currentDecision);
            setFilteredDecisions((prev) =>
                            prev.map((item) =>
                                item.ALGORITHM_ID === currentDecision.ALGORITHM_ID
                                    ? {
                                          ...item,
                                          TRAINING_DATA_DESCRIPTION: values.TRAINING_DATA_DESCRIPTION,
                                          LAST_UPDATED_TIME: ""
                                      }
                                    : item
                            )
                        );
             setIsEditModalVisible(false);            
    };

    const handleAdd = async (values) => {
        try {
            const newData = {
                "algorithm_id": values.ALGORITHM_ID,
                "algorithm_name": values.ALGORITHM_NAME,
                "algorithm_type": values.ALGORITHM_TYPE,
                "description": values.DESCRIPTION,
                "algorithm_image": values.ALGORITHM_IMAGE,
                "model_path": values.MODEL_PATH,
                "create_time": new Date().toISOString(),
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

    const handleImportData = (record) => {
        setCurrentDecision(record);
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    };

    const onFileSelected = async (event) => {
        const file = event.target.files[0];
        if (file && currentDecision) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(__APP_CONFIG__.uploadFile, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.status === 'success') {
                    const filePath = result.file_path;
                    setFilteredDecisions((prev) =>
                        prev.map((item) =>
                            item.ALGORITHM_ID === currentDecision.ALGORITHM_ID
                                ? {
                                    ...item,
                                    TRAINING_DATA_PATH: filePath,
                                    TRAINING_DATA_DESCRIPTION: '未训练',
                                    LAST_UPDATED_TIME: ''
                                }
                                : item
                        )
                    );
                    message.success(`文件 "${filePath}" 已导入，训练状态已重置`);
                } else {
                    message.error(`文件上传失败: ${result.message}`);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                message.error('文件上传失败');
            }
        }
    };



const handleExportFolderSelected = async (record) => {
    const dataToSend = {
                    action: 'start_training',
                    ALGORITHM_ID: record.ALGORITHM_ID,
                    ALGORITHM_NAME: record.ALGORITHM_NAME,
                    ALGORITHM_TYPE: record.ALGORITHM_TYPE,
                    DESCRIPTION: record.DESCRIPTION,
                    ALGORITHM_IMAGE: record.ALGORITHM_IMAGE,
                    MODEL_PATH: record.MODEL_PATH,
                    CREATE_TIME: record.CREATE_TIME,
                    TRAINING_DATA_PATH: record.TRAINING_DATA_PATH,
                };
        try {
          const response = await fetch(__APP_CONFIG__.OutExport, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dataToSend: dataToSend
            }),
          });
    
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
    
          message.success('模型导出成功');
        //   fetchModels(); // 重新获取数据
        //   setIsModalVisible(false);
        } catch (error) {
          console.error('Error out model:', error);
          message.error('模型导出失败');
        }
    }


    const onjsonFileSelected = async (event) => {

        const file = event.target.files[0];
        // console.log("1111111111111");
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const response = await fetch(__APP_CONFIG__.uploadextratable, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.status === 'success') {
                    const filePath = result.file_path;
                    console.log(filePath);
                    fetchDecisions();
                    message.success(`文件 "${filePath}" 已导入`);
                    setIsAddModalVisible(false);
                } else {
                    message.error(`文件上传失败: ${result.message}`);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                message.error('文件上传失败');
            }
        }
    };

     const handleStartTraining = async (record) => {
        if (record.TRAINING_DATA_PATH === '未选择') {
            message.error('请先导入训练数据');
            return;
        }

        setTrainingLoading((prev) => ({ ...prev, [record.ALGORITHM_ID]: true }));

        return new Promise((resolve) => {
            const ws = new WebSocket(__APP_CONFIG__.websocketUrl);

            ws.onopen = () => {
                const dataToSend = {
                    action: 'start_training',
                    ALGORITHM_ID: record.ALGORITHM_ID,
                    ALGORITHM_NAME: record.ALGORITHM_NAME,
                    ALGORITHM_TYPE: record.ALGORITHM_TYPE,
                    DESCRIPTION: record.DESCRIPTION,
                    ALGORITHM_IMAGE: record.ALGORITHM_IMAGE,
                    MODEL_PATH: record.MODEL_PATH,
                    CREATE_TIME: record.CREATE_TIME,
                    TRAINING_DATA_PATH: record.TRAINING_DATA_PATH,
                };
                ws.send(JSON.stringify(dataToSend));
            };

            ws.onmessage = (event) => {
                try {
                    const messageData = JSON.parse(event.data);

                    if (messageData.status === '训练完成' && messageData.ALGORITHM_ID && messageData.time) {
                        setFilteredDecisions((prev) =>
                            prev.map((item) =>
                                item.ALGORITHM_ID === messageData.ALGORITHM_ID
                                    ? {
                                        ...item,
                                        TRAINING_STATUS: messageData.status,
                                        LAST_UPDATED_TIME: formatDate(messageData.time)
                                    }
                                    : item
                            )
                        );
                        message.success(`模型 ${messageData.ALGORITHM_ID} 训练完成`);
                    } else if (messageData.status === '训练失败' && messageData.ALGORITHM_ID) {
                        message.error(`模型 ${messageData.ALGORITHM_ID} 训练失败: ${messageData.message}`);
                    }
                    ws.close();
                    setTrainingLoading((prev) => ({ ...prev, [record.ALGORITHM_ID]: false }));
                    resolve();
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                    message.error('解析训练结果失败');
                    ws.close();
                    setTrainingLoading((prev) => ({ ...prev, [record.ALGORITHM_ID]: false }));
                    resolve();
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                message.error('WebSocket 连接错误');
                ws.close();
                setTrainingLoading((prev) => ({ ...prev, [record.ALGORITHM_ID]: false }));
                resolve();
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed.');
            };
        });
    };

    const columns = [
        { title: '序号', dataIndex: 'key', key: 'index', render: (text, record, index) => index + 1, onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '模型 ID', dataIndex: 'ALGORITHM_ID', key: 'ALGORITHM_ID', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '模型名称', dataIndex: 'ALGORITHM_NAME', key: 'ALGORITHM_NAME', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '模型类型', dataIndex: 'ALGORITHM_TYPE', key: 'ALGORITHM_TYPE', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '描述', dataIndex: 'DESCRIPTION', key: 'DESCRIPTION', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '模型路径', dataIndex: 'ALGORITHM_IMAGE', key: 'ALGORITHM_IMAGE', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '文件名', dataIndex: 'MODEL_PATH', key: 'MODEL_PATH', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '创建时间', dataIndex: 'CREATE_TIME', key: 'CREATE_TIME', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '训练数据路径', dataIndex: 'TRAINING_DATA_PATH', key: 'TRAINING_DATA_PATH', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '训练数据描述', dataIndex: 'TRAINING_DATA_DESCRIPTION', key: 'TRAINING_DATA_DESCRIPTION', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        { title: '最后更新时间', dataIndex: 'LAST_UPDATED_TIME', key: 'LAST_UPDATED_TIME', onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }) },
        {
            title: '操作',
            key: 'action',
            width:200,
            onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
            render: (text, record) => (
                <div>
                    <Tooltip title="查看">
                        <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentDecision(record); setIsEditMode(true); setIsEditModalVisible(true); }} />
                    </Tooltip>
                    <Tooltip title="删除">
                        <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record.ALGORITHM_ID)} />
                    </Tooltip>
                    <Tooltip title="数据导入">
                        <Button type="link" icon={<UploadOutlined />} onClick={() => handleImportData(record)} />
                    </Tooltip>
                    <Tooltip title="数据导出">
                        <Button type="link" icon={<UploadOutlined />} onClick={() => handleExportFolderSelected(record)} />
                    </Tooltip>
                    <Tooltip title={trainingLoading[record.ALGORITHM_ID] ? '训练中' : '开始训练'}>
                        <Button
                            type="link"
                            icon={<PlayCircleOutlined />}
                            onClick={() => handleStartTraining(record)}
                            disabled={trainingLoading[record.ALGORITHM_ID]}
                            loading={trainingLoading[record.ALGORITHM_ID]}
                        />
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <Card 
        title={
            <div>
            额外决策模型库
            <SettingOutlined style={{ marginLeft: 8 }} />
            </div>
        }
        bordered={true}
        >
            <span style={{color:'white'}}>检索：</span>
            <Select value={searchField} onChange={setSearchField} style={{ width: 120, marginRight: 8 }}>
                <Select.Option value="algorithm_id">模型 ID</Select.Option>
                <Select.Option value="algorithm_name">模型名称</Select.Option>
                <Select.Option value="algorithm_type">模型类型</Select.Option>
                {/* <Select.Option value="description">描述</Select.Option> */}
                <Select.Option value="algorithm_image">模型路径</Select.Option>
                <Select.Option value="model_path">文件名</Select.Option>
                <Select.Option value="create_time">创建时间</Select.Option>
                {/* <Select.Option value="training_data_path">训练数据路径</Select.Option> */}
                {/* <Select.Option value="training_data_description">描述</Select.Option> */}
                {/* <Select.Option value="last_updated_time">最后更新时间</Select.Option> */}
            </Select>
            <Input placeholder="单行输入" value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 8,marginBottom:18 }} />
            <Button onClick={handleSearch}>搜索</Button>
            <Table
                dataSource={filteredDecisions}
                columns={columns}
                rowKey="key"
                tableLayout="fixed" // 关键属性：使用固定布局
                style={{ width: '100%' }} // 确保表格有明确宽度
            />
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileSelected}
                style={{ display: 'none' }}
            />
            <Modal
                title={isEditMode ? '编辑额外决策模型' : '查看额外决策模型'}
                open={isEditModalVisible}
                onOk={handleOkEdit}
                onCancel={() => setIsEditModalVisible(false)}
                footer={isEditMode ? undefined : [<Button key="back" onClick={() => setIsEditModalVisible(false)}>关闭</Button>]}
            >
                <Form form={editForm} initialValues={currentDecision} onFinish={handleFinishEdit}>
                    <Form.Item label="模型 ID" name="ALGORITHM_ID">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="模型名称" name="ALGORITHM_NAME">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="模型类型" name="ALGORITHM_TYPE">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="描述" name="DESCRIPTION">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="模型路径" name="ALGORITHM_IMAGE">
                        <Input disabled={true} />
                    </Form.Item>
                    {/* {!isEditMode && currentDecision?.ALGORITHM_IMAGE && (
                        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                            <img
                                src={currentDecision.ALGORITHM_IMAGE}
                                alt="算法图片"
                                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', marginTop: '10px' }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/150x100/CCCCCC/FFFFFF?text=图片加载失败";
                                    message.error('图片加载失败');
                                }}
                            />
                        </Form.Item>
                    )} */}
                    <Form.Item label="文件名" name="MODEL_PATH">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="训练数据路径" name="TRAINING_DATA_PATH">
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item label="训练数据描述" name="TRAINING_DATA_DESCRIPTION">
                        <Input disabled={!isEditMode} />
                    </Form.Item>
                    <Form.Item label="最后更新时间" name="LAST_UPDATED_TIME">
                        <Input disabled={true} />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="新增额外决策模型"
                open={isAddModalVisible}
                onOk={() => addForm.submit()}
                onCancel={() => setIsAddModalVisible(false)}
            footer={null}>   
                <Form form={addForm} onFinish={handleAdd}>
                    {/* <Form.Item label="算法 ID" name="ALGORITHM_ID" rules={[{ required: true, message: '请输入算法 ID' }]}>
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
                    </Form.Item> */}
                    <Form.Item label="模型路径" name="MODEL_PATH" rules={[{ required: true, message: '请输入模型路径' }]}>
                        <input
                            type="file"
                            ref={jsonfileInputRef}
                            onChange={onjsonFileSelected}
                            style={{ display: 'none' }}
                        />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                // setIsAddModalVisible(true);
                                // addForm.resetFields();
                                jsonfileInputRef.current.value = '';
                                jsonfileInputRef.current.click();
                                console.log(jsonfileInputRef);
                            }}
                        >
                            浏览
                        </Button>
                    </Form.Item>
                    {/* <Form.Item label="创建时间" name="CREATE_TIME">
                        <Input disabled={true} value={formatDate(new Date().toISOString())} />
                    </Form.Item> */}
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