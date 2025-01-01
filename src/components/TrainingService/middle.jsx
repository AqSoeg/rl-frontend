import React, { useState, useEffect } from 'react';
import { Select, Button, Input, Card } from 'antd';

const { Option } = Select;

const Middle = ({ selectedScenario }) => {
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [envParamsMap, setEnvParamsMap] = useState({});

  useEffect(() => {
    // 当 selectedScenario 变化时，重置所有的选择框
    setEntity('');
    setAttribute('');
    setValue('');
    setEntityParamsInfo('');

    if (selectedScenario && selectedScenario.env_params) {
      const envParamsMap = selectedScenario.env_params.reduce((acc, param) => {
        acc[param.name] = param.params.map(p => ({
          key: p[0],
          label: p[1],
          value: p[2],
          options: p[3]
        }));
        return acc;
      }, {});

      setEnvParamsMap(envParamsMap);
    }
  }, [selectedScenario]);

  const [entityParamsInfo, setEntityParamsInfo] = useState(''); // 新增状态

  const handleEntityChange = (value) => {
    setEntity(value);
    setAttribute(''); // 重置属性选择框
    setValue(''); // 重置值选择框
  
    if (selectedScenario && selectedScenario.env_params) {
      const selectedEntity = selectedScenario.env_params.find(param => param.name === value);
      if (selectedEntity) {
        const paramsInfo = selectedEntity.params.map(param => {
          const [key, label, defaultValue, options] = param;
          return `${label}：${defaultValue}（默认值）`;
        }).join('，'); // 使用中文逗号连接字符串
        setEntityParamsInfo(paramsInfo);
      }
    }
  
  };

  const handleAttributeChange = (value) => {
    setAttribute(value);
    const attributeInfo = envParamsMap[entity].find(attr => attr.key === value);
    setValue(attributeInfo ? attributeInfo.value : ''); // 设置默认值

  };

  const handleValueChange = (value) => {
    setValue(value);

  };
  const handleUpdate = async () => {
    const selectedEntityParams = envParamsMap[entity];
  if (selectedEntityParams) {
    // 查找所选属性的完整信息
    const selectedAttributeInfo = selectedEntityParams.find(attr => attr.key === attribute);
    if (selectedAttributeInfo) {
      // 使用属性的 label 而不是 key
      console.log(`更新场景: 实体=${entity}, 属性=${selectedAttributeInfo.label}, 值=${value}`);
    }
  }
    setEntityParamsInfo('更新成功');
    // try {
    //   // 查找所选实体的参数信息
    //   const selectedEntityParams = envParamsMap[entity];
    //   if (selectedEntityParams) {
    //     const selectedAttributeInfo = selectedEntityParams.find(attr => attr.key === attribute);
    //     if (selectedAttributeInfo) {
    //       // 准备发送到后端的数据
    //       const requestData = {
    //         entity: entity,
    //         attribute: selectedAttributeInfo.label,
    //         value: value,
    //       };

    //       // 发送请求到后端
    //       const response = await fetch('http://localhost:5000/update', {
    //         method: 'POST', // 或者是 'GET', 取决于你的后端要求
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify(requestData),
    //       });

    //       // 检查响应状态
    //       if (response.ok) {
    //         // 解析后端返回的数据
    //         const responseData = await response.json();
    //         // 更新状态以显示后端反馈的信息
    //         setEntityParamsInfo(responseData.message || '更新成功');
    //       } else {
    //         // 处理错误情况
    //         setEntityParamsInfo('更新失败，请重试');
    //       }
    //     } else {
    //       setEntityParamsInfo('请选择一个属性');
    //     }
    //   } else {
    //     setEntityParamsInfo('请选择一个实体');
    //   }
    // } catch (error) {
    //   // 处理网络错误或其他异常
    //   setEntityParamsInfo('网络错误或服务器异常');
    // }
  };

  const entityOptions = Object.keys(envParamsMap).map(name => (
    <Option key={name} value={name}>
      {name}
    </Option>
  ));

  const attributeOptions = () => {
    return envParamsMap[entity] ? envParamsMap[entity].map(param => (
      <Option key={param.key} value={param.key}>
        {param.label}
      </Option>
    )) : [];
  };

  const valueOptions = () => {
    if (!selectedScenario || !envParamsMap[entity]) return [];

    const currentParam = envParamsMap[entity].find(param => param.key === attribute);
    if (!currentParam) return [];

    return currentParam.options.map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  };

  return (
    <div>
      <div className="image-container">
        <Button className="first-button">图片区域</Button>
      </div>
      <div className='edit-container'>
        <Card title="场景编辑" bordered={false}>
          <span>实体：</span>
          <Select
            className="select-style"
            placeholder="选择实体"
            value={entity}
            onChange={handleEntityChange}
            style={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
          >
            {entityOptions}
          </Select>
          <span>属性：</span>
          <Select
            className="select-style"
            placeholder="选择属性"
            value={attribute}
            onChange={handleAttributeChange}
            style={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
          >
            {attributeOptions()}
          </Select>
          <span>值：</span>
          <Select
            className="select-style"
            placeholder="选择值"
            value={value}
            onChange={handleValueChange}
            style={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
          >
            {valueOptions()}
          </Select>
          <Button type="primary" className="update-button" onClick={handleUpdate}>
            更新
          </Button>
          <Input.TextArea className='input' rows={4} value={entityParamsInfo} disabled />
        </Card>
      </div>
      <div className="form-item1">
        <Button className='third-button'>保存场景</Button>
      </div>
    </div>
  );
};

export default Middle;