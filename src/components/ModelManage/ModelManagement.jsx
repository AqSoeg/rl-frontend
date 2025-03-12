import React, { useState, useEffect } from 'react';
import AlgorithmLibrary from './algorithmlibrary';
import ModelLibrary from './modellibrary';
import OfflineDatabase from './offlinedatabase';
import ScenarioLibrary from './scenariolibrary';
import DecisionModelLibrary from './decisionmodellibrary';
import './ModelManagement.css';

const ModelManagement = () => {
  const [activeComponent, setActiveComponent] = useState('ModelLibrary');
  const [models, setModels] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [decisions, setDecisions] = useState([]);

  const fetchModels = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.getModels, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: 'model' }), // 指定库
      });
      const data = await response.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (error) {
      console.error('模型加载失败:', error);
    }
  };
  const fetchScenarios = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.scenarios, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: 'scenario' }), // 指定库
      });
      const data = await response.json();
      
      setScenarios(data);
    } catch (error) {
      console.error('模型加载失败:', error);
    }
  };

  const fetchAlgorithms = async () => {
    try {
        const response = await fetch(__APP_CONFIG__.get_algorithm, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ library: 'algorithm' }), // 指定库
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        setAlgorithms(data); // 确保 data 是一个数组
    } catch (error) {
        console.error('Error fetching algorithms:', error);
    }
};

  const fetchDatasets = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.get_datasets, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: 'dataset' }), // 指定库
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      setDatasets(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const fetchDecisions = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.getDecisionModels, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: 'decision' }), // 指定库
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      
      setDecisions(data);
    } catch (error) {
      console.error('Error fetching decision models:', error);
      message.error('获取决策模型失败');
    }
  };
  
  useEffect(() => {
    fetchModels();
    fetchAlgorithms();
    fetchDatasets();
    fetchScenarios();
    fetchDecisions(); // 调用 fetchDecisions
  }, []);

  const handleButtonClick = (componentName) => {
    setActiveComponent(componentName);
  };

  return (
    <div className='model'>
      <div className='modelleft'>
        <button className='button' onClick={() => handleButtonClick('ModelLibrary')}>智能体模型库</button>
        <button className='button' onClick={() => handleButtonClick('AlgorithmLibrary')}>算法库</button>
        <button className='button' onClick={() => handleButtonClick('OfflineDatabase')}>离线数据集库</button>
        <button className='button' onClick={() => handleButtonClick('ScenarioLibrary')}>想定场景库</button>
        <button className='button' onClick={() => handleButtonClick('DecisionModelLibrary')}>决策模型库</button>
      </div>
      <div className='modelright'>
        {activeComponent === 'ModelLibrary' && <ModelLibrary data={models} fetchModels={fetchModels} />}
        {activeComponent === 'AlgorithmLibrary' && <AlgorithmLibrary algorithms={algorithms} fetchAlgorithms={fetchAlgorithms} />}
        {activeComponent === 'OfflineDatabase' && <OfflineDatabase datasets={datasets} fetchDatasets={fetchDatasets} />}
        {activeComponent === 'ScenarioLibrary' && <ScenarioLibrary scenarios={scenarios} fetchScenarios={fetchScenarios} />}
        {activeComponent === 'DecisionModelLibrary' && <DecisionModelLibrary decisions={decisions} fetchDecisions={fetchDecisions} />}
      </div>
    </div>
  );
};

export default ModelManagement;