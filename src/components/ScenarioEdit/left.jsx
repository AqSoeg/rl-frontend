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
      <div className="scenario-header">
        <label style={{fontSize:20,color:'white'}}>想定场景：</label>
        <Select value={selectedScenarioName} onChange={handleScenarioSelectChange} placeholder="请选择想定" className="scenario-select">
          {scenarios.map((scenario) => (
            <Option key={scenario.name} value={scenario.name}>{scenario.name}</Option>
          ))}
        </Select>
      </div>

      <div className="config-section">
        <Segmented 
          options={['红方', '蓝方']} 
          value={activeSide} 
          onChange={(value) => setActiveSide(value)} 
          block 
          className="side-selector"
        />

        <div className="entity-selector-container">
          <TreeSelect
            className="entity-tree-select"
            value={selectedTreeValue}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            treeData={treeData}
            placeholder="请选择实体及其属性"
            treeDefaultExpandAll
            onChange={handleTreeSelectChange}
          />
          <Button icon={<PlusOutlined />} disabled className="add-button" />
        </div>
        
        <div>
          <label>值：</label>
          <Select placeholder="选择值" value={value} onChange={handleValueChange} className="value-select" disabled={!attribute}>
            {valueOptions()}
          </Select>
        </div>
      </div>

      <Space className="action-buttons">
        <Button type="primary" onClick={handleUpdate}>更新</Button>
        <Button type="primary" onClick={handleSave}>保存</Button>
      </Space>
    </Card>
  );
});

export default Left;