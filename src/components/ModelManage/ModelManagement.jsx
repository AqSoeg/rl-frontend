import React, { useState } from 'react';
import AlgorithmLibrary from './algorithmlibrary';
import ModelLibrary from './modellibrary';
import OfflineDatabase from './offlinedatabase';
import BehaviorLibrary from './behaviorlibrary';
import './ModelManagement.css'

const ModelManagement = () => {
  const [activeComponent, setActiveComponent] = useState('ModelLibrary');

  const handleButtonClick = (componentName) => {
    setActiveComponent(componentName);
  };

  return (
    <div className='model'>
      <div className='modelleft'>
        <button className='button' onClick={() => handleButtonClick('ModelLibrary')}>智能体模型库</button>
        <button className='button' onClick={() => handleButtonClick('BehaviorLibrary')}>行为规则库</button>
        <button className='button' onClick={() => handleButtonClick('AlgorithmLibrary')}>算法模型库</button>
        <button className='button' onClick={() => handleButtonClick('OfflineDatabase')}>离线数据库</button>
      </div>
      <div className='modelright'>
        {activeComponent === 'ModelLibrary' && <ModelLibrary />}
        {activeComponent === 'BehaviorLibrary' && <BehaviorLibrary />}
        {activeComponent === 'AlgorithmLibrary' && <AlgorithmLibrary />}
        {activeComponent === 'OfflineDatabase' && <OfflineDatabase />}
      </div>
    </div>
  );
};

export default ModelManagement;