import React, { useState, useEffect } from 'react';
import { Select, Button, Card, message, Tree, Space, Segmented } from 'antd'; // 引入 Tree 组件
import { PlusOutlined } from '@ant-design/icons';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import sidebarStore from '../AgentEditor/SidebarStore';

const { Option } = Select;

const Left = observer(({ scenarios }) => {
  const [selectedScenarioName, setSelectedScenarioName] = useState(sidebarStore.scenarioName);

  // -- State Management --
  const [rolesWithData, setRolesWithData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]); // 全局控制所有树的选中项

  // 全局追踪当前激活的实体和属性
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');

  const [envParamsMap, setEnvParamsMap] = useState({});
  const [activeSide, setActiveSide] = useState('红方');

  // --- useEffect Hooks ---
  useEffect(() => {
    const unsubscribe = sidebarStore.subscribe(() => {
      setSelectedScenarioName(sidebarStore.scenarioName);
    });
    return () => unsubscribe();
  }, []);

  // 这个 effect 会在 selectedScenarioName 变化时，从总列表中找到场景对象并更新到 store
  useEffect(() => {
    if (scenarios.length > 0 && selectedScenarioName) {
      const selectedScene = scenarios.find(scenario => scenario.name === selectedScenarioName);
      if (selectedScene) {
        intelligentStore.selectScenario(selectedScene);
      }
    }
  }, [scenarios, selectedScenarioName]);

  // 主要 Effect: 当 store 中的场景对象变化时，构建并列的、默认折叠的树结构
  useEffect(() => {
    // 重置所有下游状态
    setEntity('');
    setAttribute('');
    setValue('');
    setEnvParamsMap({});
    setRolesWithData([]);
    setSelectedKeys([]);

    const currentScenario = intelligentStore.selectedScenario;
    if (currentScenario) {
      // 更新 activeSide 来匹配当前场景
      if (currentScenario.name === '城市交通') {
        setActiveSide('红方');
      } else if (currentScenario.name === '工业生产线') {
        setActiveSide('蓝方');
      }

      const newEnvParamsMap = (currentScenario.env_params || []).reduce((acc, param) => {
        acc[param.name] = param.params.map(p => ({ key: p[0], label: p[1], value: p[2], options: p[3] }));
        return acc;
      }, {});
      setEnvParamsMap(newEnvParamsMap);

      const rolesData = (currentScenario.roles || []).map(role => {
        const treeDataForRole = [{
          title: role.name,
          key: role.id,
          selectable: false,
          children: (role.entities || []).map(entityInRole => {
            const entityParams = newEnvParamsMap[entityInRole.name];
            if (!entityParams) return null;
            return {
              title: entityInRole.name,
              key: `${role.id}|${entityInRole.name}`,
              selectable: false,
              children: entityParams.map(param => ({
                title: param.label,
                key: `${role.id}|${entityInRole.name}|${param.key}`,
                isLeaf: true,
              })),
            };
          }).filter(Boolean),
        }];
        return {
          roleId: role.id,
          treeData: treeDataForRole,
        };
      });
      setRolesWithData(rolesData);
    }
  }, [intelligentStore.selectedScenario]); // 依赖 store 中的场景对象

  // --- Event Handlers ---

  // 新增：处理红蓝方切换的逻辑
  const handleSideChange = (side) => {
    setActiveSide(side); // 首先更新UI状态

    const targetScenarioName = side === '红方' ? '城市交通' : '工业生产线';
    
    // 检查当前场景是否已经是目标场景，避免不必要的重渲染
    if (selectedScenarioName === targetScenarioName) {
        return;
    }
    
    // 从总场景列表中找到目标场景对象
    const targetScenario = scenarios.find(s => s.name === targetScenarioName);
    
    if (targetScenario) {
        // 更新 selectedScenarioName，这将触发上面的 useEffect 来重新加载整个组件
        setSelectedScenarioName(targetScenario.name);
        sidebarStore.setScenario(targetScenario.id, targetScenario.name); // 同步到 sidebar
    } else {
        message.error(`未找到场景: ${targetScenarioName}`);
    }
  };


  const handleScenarioSelectChange = (value) => {
    // 当手动选择场景时，也更新 selectedScenarioName
    setSelectedScenarioName(value);
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    if(selectedScene) {
        sidebarStore.setScenario(selectedScene.id, selectedScene.name);
    }
  };

  const handleTreeSelect = (keys, info) => {
    if (keys.length === 0) {
      setSelectedKeys([]);
      setEntity('');
      setAttribute('');
      setValue('');
      return;
    }
    if (!info.node.isLeaf) return;
    const selectedKey = keys[0];
    setSelectedKeys([selectedKey]);
    const [, selectedEntity, selectedAttrKey] = selectedKey.split('|');
    setEntity(selectedEntity);
    setAttribute(selectedAttrKey);
    const attributeInfo = envParamsMap[selectedEntity]?.find(attr => attr.key === selectedAttrKey);
    setValue(attributeInfo ? attributeInfo.value : '');
  };

  const handleValueChange = (val) => {
    setValue(val);
  };

  const handleUpdate = async () => {
    if (!intelligentStore.selectedScenario || !entity || !attribute) {
      message.error('请先在上方选择一个属性');
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      intelligentStore.setupdataparams(data.updatedScenario.env_params);
      
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

  const handleSave = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.SaveScenarios, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: '',
        }),
      });

      if (!response.ok) {
        throw new Error('网络响应错误');
      }

      const data = await response.json();
      if (data.status === 'success') {
          message.success('保存成功！');
      } else {
          message.error('保存失败: ' + (data.message || '未知错误'));
      }
    } catch (error) {
      console.error('保存场景时出错:', error);
      message.error('保存失败，请检查网络或联系管理员');
    }
  }

  const valueOptions = () => envParamsMap[entity]?.find(param => param.key === attribute)?.options.map(option => <Option key={option} value={option}>{option}</Option>) || [];

  return (
    <Card title="场景编辑">
      <div className="scenario-header">
        <label style={{ fontSize: 20, color: 'white' }}>想定场景：</label>
        <Select value={selectedScenarioName} onChange={handleScenarioSelectChange} placeholder="请选择想定" className="scenario-select">
          {scenarios.map((scenario) => (
            <Option key={scenario.name} value={scenario.name}>{scenario.name}</Option>
          ))}
        </Select>
      </div>

      <div className="config-section">
        {/* Segmented 的 onChange 事件现在指向新的处理函数 */}
        <Segmented
          options={['红方', '蓝方']}
          value={activeSide}
          onChange={handleSideChange}
          block
          className="side-selector"
        />

        {rolesWithData.map(role => (
          <div key={role.roleId} style={{ marginBottom: '16px' }}>
            <Tree
              className="entity-tree-select"
              treeData={role.treeData}
              selectedKeys={selectedKeys}
              onSelect={handleTreeSelect}
              blockNode
            />
          </div>
        ))}
        
        <div style={{marginTop: '24px'}}>
          <label>值：</label>
          <Select placeholder="请先在上方选择属性" value={value} onChange={handleValueChange} className="value-select" disabled={!attribute}>
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