import React, { useState, useEffect } from 'react';
import Left from './left';
import Middle from './middle';
import axios from 'axios';
import Right from './right';
import RighT from './1';
import './TrainingService.css'; // 引入CSS文件

const TrainingService = () => {
  const [scenarios, setScenarios] = useState([]);
  const [algorithms, setAlgorithms] = useState([]); // 新增状态用于存储算法数据
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null); // 新增状态用于存储选中的场景

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await axios.get('http://localhost:3000/scenarios');
        setScenarios(response.data);
      } catch (error) {
        console.error('Error fetching scenarios:', error);
      }
    };
    fetchScenarios();
  }, []);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await axios.get('http://localhost:3001/algorithms'); // 假设您的后端API端点
        setAlgorithms(response.data);
      } catch (error) {
        console.error('Error fetching algorithms:', error);
      }
    };
    fetchAlgorithms();
  }, []);

  return (
    <div className='trainingservice'>
      <div className='left'>
        <Left 
          scenarios={scenarios} 
          algorithms={algorithms} 
          onAlgorithmSelect={setSelectedAlgorithm} 
          onScenarioSelect={setSelectedScenario} // 提供场景选择回调
        />
      </div>
      <div className='middle'>
        <Middle selectedScenario={selectedScenario}/> {/* 传递选中场景 */}
      </div>
      <div className='right'>
        <Right 
          algorithms={algorithms}
          selectedAlgorithm={selectedAlgorithm} 
          selectedScenario={selectedScenario} // 传递选中场景
        />
      </div>
      <div className='righT'>
        <RighT 
          selectedAlgorithm={selectedAlgorithm} 
          selectedScenario={selectedScenario} // 传递选中场景
        />
      </div>
    </div>
  );
};

export default TrainingService;