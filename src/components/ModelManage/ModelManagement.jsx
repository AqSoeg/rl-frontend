import React, { useState, useEffect } from 'react';
import AlgorithmLibrary from './algorithmlibrary';
import ModelLibrary from './modellibrary';
import OfflineDatabase from './offlinedatabase';
import BehaviorLibrary from './behaviorlibrary';
import './ModelManagement.css';
import axios from 'axios';
const ModelManagement = () => {
  const [activeComponent, setActiveComponent] = useState('ModelLibrary');
  const [data, setData] = useState(null);
    // 组件挂载时只发起一次请求获取数据
 

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get('http://localhost:3001/1');
          setData(response.data);
        } catch (error) {
          console.error('There was an error fetching the data!', error);
        }
      };
      fetchData(); // 调用函数以执行数据获取
    }, []); 

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
      {activeComponent === 'ModelLibrary' && <ModelLibrary  data={data}/>}
        {activeComponent === 'BehaviorLibrary' && <BehaviorLibrary />}
        {activeComponent === 'AlgorithmLibrary' && <AlgorithmLibrary />}
        {activeComponent === 'OfflineDatabase' && <OfflineDatabase />}
      </div>
    </div>
  );
};

export default ModelManagement;