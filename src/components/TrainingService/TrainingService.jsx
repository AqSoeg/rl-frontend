import React, { useEffect,useState } from 'react';
import Left from './left';
import Middle from './middle';
import axios from 'axios';
import Right from './right';
import RighT from './1';
import './TrainingService.css';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';

const TrainingService = observer(() => {
  const [scenarios, setScenarios] = useState([]);
  const [algorithms, setAlgorithms] = useState([]);

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
        const response = await axios.get('http://localhost:3001/algorithms');
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
        />
      </div>
      <div className='middle'>
        <Middle />
      </div>
      <div className='right'>
        <Right 
          algorithms={algorithms}
        />
      </div>
      <div className='righT'>
        <RighT />
      </div>
    </div>
  );
});

export default TrainingService;