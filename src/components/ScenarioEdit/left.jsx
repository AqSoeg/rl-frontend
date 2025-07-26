import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import sidebarStore from '../AgentEditor/SidebarStore';

const { Option } = Select;

const Left = observer(({ scenarios }) => {
    const [agentRoles, setAgentRoles] = useState([]);

  // 使用 SidebarStore 中的状态初始化选定的想定场景和智能体角色
  const [selectedScenario, setSelectedScenario] = useState(sidebarStore.scenarioName);
  const [selectedAgentRole, setSelectedAgentRole] = useState(sidebarStore.roleName);

  // 监听 SidebarStore 中的状态变化
  useEffect(() => {
    const unsubscribe = sidebarStore.subscribe(() => {
      setSelectedScenario(sidebarStore.scenarioName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 初始化场景和智能体角色
  useEffect(() => {
    if (scenarios.length > 0 && selectedScenario) {
      const selectedScene = scenarios.find(scenario => scenario.name === selectedScenario);
      if (selectedScene) {
        intelligentStore.selectScenario(selectedScene);
      }
    }
  }, [scenarios, selectedScenario]);


 
  const handleScenarioSelectChange = (value) => {
    const selectedScene = scenarios.find(scenario => scenario.name === value);
    if (selectedScene) {
      intelligentStore.selectScenario(selectedScene);
      sidebarStore.setScenario(selectedScene.id, selectedScene.name);
    }
  };


  
  return (
    <div className='left'>
      <div className="form-item">
        <label>想定场景</label>
        <Select 
          value={selectedScenario} 
          onChange={handleScenarioSelectChange}
          placeholder="请选择"
        >
          {scenarios.map((scenario, index) => (
            <Option key={scenario.name} value={scenario.name}>
              {scenario.name}
            </Option>
          ))}
        </Select>
      </div>
      
    </div>
  );
});

export default Left;