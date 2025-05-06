import React, { useEffect, useState } from 'react';
import Left from './left';

import './TrainingService.css';
import { observer } from 'mobx-react';
import AgentTrainingPanel from './AgentTrainingPanel.jsx'
const TrainingService = observer(() => {
  const [scenarios, setScenarios] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [decisionModels, setDecisionModels] = useState([]);

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

  const fetchAlgorithms = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.get_algorithm, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      setAlgorithms(data); // 确保后端返回的数据结构与这里匹配
    } catch (error) {
      console.error('Error fetching algorithms:', error);
    }
  };

  const fetchDatasets = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.get_datasets, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      setDatasets(data); // 确保后端返回的数据结构与这里匹配
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };
  const fetchDecisions = async () => {
    try {
      const response = await fetch(__APP_CONFIG__.getDecisionModels, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      const data = await response.json();
      setDecisionModels(data);
    } catch (error) {
      console.error('Error fetching decision models:', error);
    }
  };
  useEffect(() => {
    fetchScenarios();
    fetchAlgorithms();
    fetchDatasets();
    fetchDecisions();
  }, []);


  return (
    <div className='trainingservice'>
      <div className='left'>
        <Left
          scenarios={scenarios}
          algorithms={algorithms}
          datasets={datasets}
       
        />
      </div>
      <div className='right'>
      <AgentTrainingPanel 
        decisionModels={decisionModels} 
        fetchDecisions={fetchDecisions}
        refreshData={fetchScenarios}
      />
      </div>

    </div>
  );
});

export default TrainingService;