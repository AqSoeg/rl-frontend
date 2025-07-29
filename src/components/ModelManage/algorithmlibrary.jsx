import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Card, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const AlgorithmLibrary = ({ algorithms, fetchAlgorithms }) => {
  const [isViewEditModalVisible, setIsViewEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isAddHyperParamModalVisible, setIsAddHyperParamModalVisible] = useState(false);
  const [currentAlgorithm, setCurrentAlgorithm] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [filteredAlgorithms, setFilteredAlgorithms] = useState(algorithms || []);
  const [isEditing, setIsEditing] = useState(false);
  const [hyperParams, setHyperParams] = useState([]); // 存储新增的超参数
  const editForm = Form.useForm()[0];
  const addForm = Form.useForm()[0];
  const hyperParamForm = Form.useForm()[0];

  useEffect(() => {
    if (algorithms) {
      setFilteredAlgorithms(algorithms);
    }
  }, [algorithms]);

  useEffect(() => {
    if (currentAlgorithm) {
      editForm.setFieldsValue(currentAlgorithm);
    } else {
      editForm.resetFields();
    }
  }, [currentAlgorithm, editForm]);

  // 新增算法
  const handleAdd = async (values) => {
    try {
      const now = new Date().toISOString();
      const response = await fetch(__APP_CONFIG__.addAll, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'algorithm',
          data: { ...values, time: now, 'hyper-parameters': hyperParams },
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        message.success('算法新增成功');
        fetchAlgorithms();
        setIsAddModalVisible(false);
        setHyperParams([]); // 清空超参数列表
      } else {
        message.error(result.message || '算法新增失败');
      }
    } catch (error) {
      console.error('Error adding algorithm:', error);
      message.error('算法新增失败');
    }
  };

  // 新增超参数
  const handleAddHyperParam = (values) => {
    const { id, name, value, default: defaultValue } = values;
    const valueArray = value.split(',').map(v => parseFloat(v.trim()));
    if (!valueArray.includes(parseFloat(defaultValue))) {
      message.error('默认值必须在可选值列表中');
      return;
    }
    setHyperParams([...hyperParams, { id, name, value: valueArray, default: parseFloat(defaultValue) }]);
    setIsAddHyperParamModalVisible(false);
    hyperParamForm.resetFields();
  };

  // 删除算法
  const handleDelete = async (id) => {
    try {
      const response = await fetch(__APP_CONFIG__.deleteAll, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'algorithm',
          id: id,
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        message.success('算法删除成功');
        fetchAlgorithms();
      } else {
        message.error(result.message || '算法删除失败');
      }
    } catch (error) {
      console.error('Error deleting algorithm:', error);
      message.error('算法删除失败');
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
          type: 'algorithm',
          field: searchField,
          value: searchText
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setFilteredAlgorithms(result);
    } catch (error) {
      console.error('Error searching algorithms:', error);
      message.error('算法搜索失败');
    }
  };

  // 渲染超参数文本
  const renderHyperParametersText = (params) => {
    return params
      .map(param => `${param.name}：默认值为${param.default}，可选值为${processSelectOptions(param.value).join(', ')}`)
      .join('\n');
  };

  const columns = [
    { title: '算法id', dataIndex: 'algorithm_id', key: 'algorithm_id' },
    { title: '类型', dataIndex: 'type_name', key: 'type_name' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    // { title: '时间', dataIndex: 'time', key: 'time' ,render: time => new Date(time).toLocaleString()},
    {
      title: '超参数',
      dataIndex: 'hyper-parameters',
      key: 'hyper-parameters',
      render: (params) => <div style={{ whiteSpace: 'pre-wrap' }}>{renderHyperParametersText(params)}</div>,
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => { setCurrentAlgorithm(record); setIsEditing(false); setIsViewEditModalVisible(true); }}>查看</Button>
          <Button type="link" onClick={() => { setCurrentAlgorithm(record); setIsEditing(true); setIsViewEditModalVisible(true); }}>更新</Button>
          <Button type="link" onClick={() => handleDelete(record.algorithm_id)}>删除</Button>
        </>
      ),
    },
  ];

  // 数据处理：升序排序并去重
  const processSelectOptions = (values) => {
    const uniqueValues = [...new Set(values)];
    return uniqueValues.sort((a, b) => a - b);
  };

  // 渲染超参数表单
  const renderHyperParametersForm = () => {
    if (!currentAlgorithm) return null;

    const hyperParams = currentAlgorithm['hyper-parameters'] || [];
    return hyperParams.map(param => (
      <Form.Item
        key={param.id}
        label={param.name}
        name={`hyper-parameters.${param.id}`}
        initialValue={param.default}
      >
        <Select
          placeholder={`${param.default}`}
          disabled={!isEditing}
          options={processSelectOptions(param.value).map(v => ({ label: v, value: v }))}
        />
      </Form.Item>
    ));
  };

  // 提交表单
  const handleUpdate = async (id, values) => {
    try {
      const now = new Date().toISOString();
      const updatedHyperParameters = currentAlgorithm['hyper-parameters'].map(param => ({
        ...param,
        default: values[`hyper-parameters.${param.id}`] || param.default,
      }));

      const response = await fetch(__APP_CONFIG__.updateAll, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'algorithm',
          id: id,
          data: {
            ...values,
            'hyper-parameters': updatedHyperParameters,
            time: now
          },
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        message.success('算法更新成功');
        fetchAlgorithms();
        setIsViewEditModalVisible(false);
      } else {
        message.error(result.message || '算法更新失败');
      }
    } catch (error) {
      console.error('Error updating algorithm:', error);
      message.error('算法更新失败');
    }
  };

  return (
    <Card title="算法库" bordered={true}>
      <span>检索：</span>
      <Select value={searchField} onChange={setSearchField} style={{ width: 200, marginRight: 8 }}>
        <Select.Option value="type_name">类型</Select.Option>
        <Select.Option value="name">名称</Select.Option>
      </Select>
      <Input
        placeholder="单行输入"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 200, marginRight: 8 }}
      />
      <Button type="primary" onClick={handleSearch}>搜索</Button>

      <Table pagination={{pageSize:2}} dataSource={filteredAlgorithms} columns={columns} rowKey='algorithm_id' />

      {/* 查看和编辑算法的弹窗 */}
      <Modal
        title={isEditing ? '编辑算法' : '算法详情'}
        open={isViewEditModalVisible}
        onOk={() => editForm.submit()}
        onCancel={() => setIsViewEditModalVisible(false)}
      >
        <Form form={editForm} onFinish={(values) => isEditing ? handleUpdate(currentAlgorithm.algorithm_id, values) : setIsViewEditModalVisible(false)}>
          <Form.Item label="算法id" name="algorithm_id">
            <Input disabled={true} />
          </Form.Item>
          <Form.Item label="类型" name="type_name">
            <Input disabled={!isEditing} />
          </Form.Item>
          <Form.Item label="名称" name="name">
            <Input disabled={!isEditing} />
          </Form.Item>
          {/* <Form.Item label="时间" name="time">
            <Input disabled={true} />
          </Form.Item> */}
          {/* {renderHyperParametersForm()} */}
        </Form>
      </Modal>

      {/* 新增算法的弹窗 */}
      <Modal
        title="新增算法"
        open={isAddModalVisible}
        onOk={() => addForm.submit()}
        onCancel={() => setIsAddModalVisible(false)}
      >
        <Form form={addForm} onFinish={handleAdd}>
          <Form.Item label="算法id" name="algorithm_id">
            <Input />
          </Form.Item>
          <Form.Item label="类型" name="type_name">
            <Input />
          </Form.Item>
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="时间" name="time">
            <Input disabled={true} />
          </Form.Item>
          <Form.Item label="超参数">
            {hyperParams.map((param, index) => (
              <div key={index}>
                {param.name}：默认值为{param.default}，可选值为{param.value.join(', ')}
              </div>
            ))}
            <Button type="link" onClick={() => setIsAddHyperParamModalVisible(true)}>新增超参数</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增超参数的弹窗 */}
      <Modal
        title="新增超参数"
        open={isAddHyperParamModalVisible}
        onOk={() => hyperParamForm.submit()}
        onCancel={() => setIsAddHyperParamModalVisible(false)}
      >
        <Form form={hyperParamForm} onFinish={handleAddHyperParam}>
          <Form.Item label="ID" name="id">
            <Input />
          </Form.Item>
          <Form.Item label="名称" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="可选值" name="value">
            <Input placeholder="用逗号分隔多个值" />
          </Form.Item>
          <Form.Item label="默认值" name="default">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/*<Button*/}
      {/*  type="primary"*/}
      {/*  icon={<PlusOutlined />}*/}
      {/*  onClick={() => {*/}
      {/*    addForm.resetFields();*/}
      {/*    setIsAddModalVisible(true);*/}
      {/*  }}*/}
      {/*>*/}
      {/*  新增算法*/}
      {/*</Button>*/}
    </Card>
  );
};

export default AlgorithmLibrary;