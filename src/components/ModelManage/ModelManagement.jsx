import React, { useState, useEffect } from 'react';
import AlgorithmLibrary from './algorithmlibrary';
import ModelLibrary from './modellibrary';
import OfflineDatabase from './offlinedatabase';
import BehaviorLibrary from './behaviorlibrary';
import './ModelManagement.css';
import axios from 'axios';
const ModelManagement = () => {
  const [activeComponent, setActiveComponent] = useState('ModelLibrary');
  const REFRESH_INTERVAL = 30000;
  const [data, setData] = useState(null);
    // 组件挂载时只发起一次请求获取数据
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/scenarios');
      setData(response.data);
    } catch (error) {
      console.error('There was an error fetching the data!', error);
    } 
  };

  useEffect(() => {
    // 组件挂载时立即获取数据
    fetchData();
    // 设置定时器，定期刷新数据
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL);
    // 清除定时器，防止内存泄漏
    return () => clearInterval(intervalId);
  }, []); // 空依赖数组确保只执行一次

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