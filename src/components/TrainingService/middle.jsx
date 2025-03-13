import React, { useState, useEffect } from 'react';
import { Select, Button, Input, Card, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import axios from 'axios'; // 引入 axios 用于发送请求

const { Option } = Select;

const Middle = observer(({ refreshData }) => {
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [envParamsMap, setEnvParamsMap] = useState({});
  const [entityParamsInfo, setEntityParamsInfo] = useState('');
  const [modifiedParams, setModifiedParams] = useState({}); // 存储修改的信息

  useEffect(() => {
    setEntity('');
    setAttribute('');
    setValue('');
    setEntityParamsInfo('');

    if (intelligentStore.selectedScenario && intelligentStore.selectedScenario.env_params) {
      const envParamsMap = intelligentStore.selectedScenario.env_params.reduce((acc, param) => {
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
  }, [intelligentStore.selectedScenario]);

  const handleEntityChange = (value) => {
    setEntity(value);
    setAttribute('');
    setValue('');

    if (intelligentStore.selectedScenario && intelligentStore.selectedScenario.env_params) {
      const selectedEntity = intelligentStore.selectedScenario.env_params.find(param => param.name === value);
      if (selectedEntity) {
        const paramsInfo = selectedEntity.params.map(param => {
          const [key, label, defaultValue, options] = param;
          return `${label}：${defaultValue}（默认值）`;
        }).join('，');
        setEntityParamsInfo(paramsInfo);
      }
    }
  };

  const handleAttributeChange = (value) => {
    setAttribute(value);
    const attributeInfo = envParamsMap[entity].find(attr => attr.key === value);
    setValue(attributeInfo ? attributeInfo.value : '');
  };

  const handleValueChange = (value) => {
    setValue(value);
  };

  const handleUpdate = async () => { // 改为异步函数
    const selectedEntityParams = envParamsMap[entity];
    if (selectedEntityParams) {
      const selectedAttributeInfo = selectedEntityParams.find(attr => attr.key === attribute);
      if (selectedAttributeInfo) {
        try {
          // 发送请求到后端更新数据
          const response = await axios.post(__APP_CONFIG__.updateDbJson, {
            scenarioId: intelligentStore.selectedScenario.id,
            entityName: entity,
            attributeKey: selectedAttributeInfo.key,
            newValue: value
          });

          if (response.status === 200) {
            // 将修改的信息存入状态
            setModifiedParams(prevState => ({
              ...prevState,
              [entity]: {
                ...prevState[entity],
                [selectedAttributeInfo.label]: value,
              },
            }));

            // 显示更新成功信息
            setEntityParamsInfo(`更新成功：${entity} 的 ${selectedAttributeInfo.label} 已修改为 ${value}`);
            message.success('更新成功');
            // 调用刷新函数
            refreshData();
          } else {
            message.error('更新失败');
          }
        } catch (error) {
          message.error('更新失败');
          console.error('更新失败:', error);
        }
      } else {
        setEntityParamsInfo('请选择一个属性');
      }
    } else {
      setEntityParamsInfo('请选择一个实体');
    }
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
    if (!intelligentStore.selectedScenario || !envParamsMap[entity]) return [];

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
            popupMatchSelectWidth={false}
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
            popupMatchSelectWidth={false}
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
            popupMatchSelectWidth={false}
          >
            {valueOptions()}
          </Select>
          <Button type="primary" className="update-button" onClick={handleUpdate}>
            更新
          </Button>
          <Input.TextArea className='input' rows={4} value={entityParamsInfo} disabled />
        </Card>
      </div>
    </div>
  );
});

export default Middle;