import React from 'react';
import Left from './left';
import Middle from './middle'
import Right from './right'
import './TrainingService.css'; // 引入CSS文件


const TrainingService = () => {

  return (
    <div className='trainingservice'>
        <div className='left'>
            <Left />
        </div>
        <div className='middle'>
            <Middle />
        </div>
        <div className='right'>
            <Right />
        </div>
    </div>
  );
};

export default TrainingService;