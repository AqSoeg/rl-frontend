import React ,{useState, useEffect} from 'react';
import Left from './left';
import Middle from './middle'
import axios from 'axios';
import Right from './right'
import './TrainingService.css'; // 引入CSS文件
const TrainingService = () => {  
  const [scenarios, setScenarios] = useState([]);

  

  useEffect(() => {
    const fetchScenarios = async () => {
        try {
            const response = await axios.get('http://localhost:3001/scenarios');
            setScenarios(response.data);
        } catch (error) {
            console.error('Error fetching scenarios:', error);
        }
    };
    fetchScenarios();
  }, []);
  return (
    <div className='trainingservice'>
        <div className='left'>
            <Left scenarios={scenarios}/>
        </div>
        <div className='middle' scenarios={scenarios}>
            <Middle />
        </div>
        <div className='right'>
            <Right scenarios={scenarios}/>
        </div>
    </div>
  );
};

export default TrainingService;