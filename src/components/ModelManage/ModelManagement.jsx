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
          // Fetch model.json data first
          const modelResponse = await axios.get('tmp/model.json');
          const models = modelResponse.data; // 假设 data 是一个数组
  
          // Dynamically build URLs based on the number of items in model.json
          const urls = models.map(model => `http://localhost:3001/${model.id || models.indexOf(model)}`);
  
          // Use Promise.all to fetch data from all URLs in parallel
          const responses = await Promise.all(urls.map(url => axios.get(url)));
  
          // Aggregate the data from all responses into a single array
          const allData = responses.map(response => response.data).flat(); // 使用 flat() 方法将多维数组转换为一维数组
  
          // Set the aggregated data
          setData(allData);
        } catch (error) {
          console.error('There was an error fetching the data!', error);
        }
      };
  
      fetchData(); // Call the function to execute data fetching
    }, []); // Empty dependency array ensures this effect runs only once on component mount


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