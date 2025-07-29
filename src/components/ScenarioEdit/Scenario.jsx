import React, { useEffect, useState } from 'react';
import Left from './left';
import Right from './right.jsx';
import { observer } from 'mobx-react';
import './Scenario.css'; // 引入新的样式文件

const ScenarioEdit = observer(() => {
  const [scenarios, setScenarios] = useState([]);

  const fetchScenarios = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.scenarios, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario_id: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setScenarios(data);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  return (
    // 使用新的布局类
    <div className='scenario-edit-container'>
      <div className='scenario-left-panel'>
        <Left scenarios={scenarios} />
      </div>
      <div className='scenario-right-panel'>
        <Right />
      </div>
    </div>
  );
});

export default ScenarioEdit;