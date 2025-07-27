import React, { useState, useEffect } from 'react';
import { Select, Button, Card, message, TreeSelect, Space, Segmented } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import sidebarStore from '../AgentEditor/SidebarStore';

const { Option } = Select;

const Left = observer(({ scenarios }) => {
  const [selectedScenarioName, setSelectedScenarioName] = useState(sidebarStore.scenarioName);
  
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [envParamsMap, setEnvParamsMap] = useState({});
  
  const [treeData, setTreeData] = useState([]);
  const [selectedTreeValue, setSelectedTreeValue] = useState(undefined);
  const [activeSide, setActiveSide] = useState('红方'); 

  // --- useEffect 钩子部分 ---
  useEffect(() => {
    const unsubscribe = sidebarStore.subscribe(() => {
      setSelectedScenarioName(sidebarStore.scenarioName);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scenarios.length > 0 && selectedScenarioName) {
      const selectedScene = scenarios.find(scenario => scenario.name === selectedScenarioName);
      if (selectedScene) {
        intelligentStore.selectScenario(selectedScene);
      }
    }
  }, [scenarios, selectedScenarioName]);

  useEffect(() => {
    setEntity('');
    setAttribute('');
    setValue('');
    setEnvParamsMap({});
    setSelectedTreeValue(undefined);

    if (intelligentStore.selectedScenario && intelligentStore.selectedScenario.env_params) {
      const newEnvParamsMap = intelligentStore.selectedScenario.env_params.reduce((acc, param) => {
        acc[param.name] = param.params.map(p => ({ key: p[0], label: p[1], value: p[2], options: p[3] }));
        return acc;
      }, {});
      setEnvParamsMap(newEnvParamsMap);

      const newTreeData = intelligentStore.selectedScenario.env_params.map(entityParam => ({
        title: entityParam.name,
        value: entityParam.name,
        key: entityParam.name,
        selectable: false,
        children: entityParam.params.map(param => ({
          title: param[1],
          value: `${entityParam.name}|${param[0]}`,
          key: `${entityParam.name}|${param[0]}`,
        })),
      }));
      setTreeData(newTreeData);
    }
  }, [intelligentStore.selectedScenario]);

  // --- 事件处理函数部分 ---
  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    if (selectedScene) {
      intelligentStore.selectScenario(selectedScene);
      sidebarStore.setScenario(selectedScene.id, selectedScene.name);
      setSelectedScenarioName(selectedScene.name);
    }
  };

  const handleTreeSelectChange = (selectedValue) => {
    setSelectedTreeValue(selectedValue);
    if (selectedValue) {
      const [selectedEntity, selectedAttrKey] = selectedValue.split('|');
      setEntity(selectedEntity);
      setAttribute(selectedAttrKey);
      const attributeInfo = envParamsMap[selectedEntity]?.find(attr => attr.key === selectedAttrKey);
      setValue(attributeInfo ? attributeInfo.value : '');
    }
  };

  const handleValueChange = (val) => {
    setValue(val);
  };

  // 恢复了之前的完整更新逻辑
  const handleUpdate = async () => {
    if (!intelligentStore.selectedScenario || !entity || !attribute) {
      message.error('请先通过树形菜单选择一个属性');
      return;
    }
    try {
      const response = await fetch(__APP_CONFIG__.updateDbJson, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: intelligentStore.selectedScenario.id,
          entityName: entity,
          attributeKey: attribute,
          newValue: value
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      
      // 更新成功后刷新前端数据状态
      const updatedParamsMap = { ...envParamsMap };
      const attrToUpdate = updatedParamsMap[entity].find(attr => attr.key === attribute);
      if (attrToUpdate) attrToUpdate.value = value;
      setEnvParamsMap(updatedParamsMap);
      
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
      console.error('更新失败:', error);
    }
  };

  const handleSave = () => {
    message.success('保存成功！');
  };

  const valueOptions = () => envParamsMap[entity]?.find(param => param.key === attribute)?.options.map(option => <Option key={option} value={option}>{option}</Option>) || [];

  return (
    <Card title="场景编辑">
      <div style={{ marginBottom: 50, marginTop: 16/* -> 设置与下方元素的间距为X像素 */ }}>
        <label>想定场景：</label>
        <Select value={selectedScenarioName} onChange={handleScenarioSelectChange} placeholder="请选择想定" style={{ width: '200px' /* -> 选择框宽度占父容器 */ }} >
          {scenarios.map((scenario) => (
            <Option key={scenario.name} value={scenario.name}>{scenario.name}</Option>
          ))}
        </Select>
      </div>

      <div 
        style={{ 
          border: '1px solid #ffffffff', // -> 设置1像素宽的实线边框，颜色为灰色
          borderRadius: '6px',        // -> 设置6像素的圆角
          padding: '16px',            // -> 设置16像素的内边距
          marginBottom: '50px'        // -> 设置与底部按钮的间距为24像素
        }}
      >

        <Segmented 
          options={['红方', '蓝方']} 
          value={activeSide} 
          onChange={(value) => setActiveSide(value)} 
          block 
          style={{ marginBottom: 16 /* -> 设置与下方元素的间距为16像素 */ }}
        />

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 /* -> 使用flex布局让内部元素同行显示, 垂直居中, 并设置下外边距 */ }}>
          <TreeSelect
            style={{ flex: 1 /* -> 占据所有剩余的横向空间 */ }}
            value={selectedTreeValue}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' /* -> 设置下拉菜单的最大高度和滚动条 */ }}
            treeData={treeData}
            placeholder="请选择实体及其属性"
            treeDefaultExpandAll
            onChange={handleTreeSelectChange}
          />
          <Button icon={<PlusOutlined />} disabled style={{ marginLeft: 8 /* -> 设置与左边树形选择框的间距为8像素 */ }} />
        </div>

        {/* 值的选择 */}
        <div>
          <label>值：</label>
          <Select placeholder="选择值" value={value} onChange={handleValueChange} style={{ width: '100%' /* -> 选择框宽度占满父容器 */ }} disabled={!attribute}>
            {valueOptions()}
          </Select>
        </div>
      </div>

      {/* 底部按钮 */}
      <Space style={{ width: '100%' ,justifyContent: 'space-evenly' /* -> 容器占满整行，内容（按钮）分布 */ }}>
        <Button type="primary" onClick={handleUpdate}>更新</Button>
        <Button onClick={handleSave}>保存</Button>
      </Space>
    </Card>
  );
});

export default Left;