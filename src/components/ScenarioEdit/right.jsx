import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import DeploymentCanvas from '../TrainingService/DeploymentCanvas';

const Right = observer(() => {
  const [deploymentData, setDeploymentData] = useState(null);

  useEffect(() => {
    const fetchDeploymentData = async () => {
      if (!intelligentStore.selectedScenario) {
        setDeploymentData(null);
        return;
      }
      
      try {
        const response = await fetch(__APP_CONFIG__.get_deployment_image, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId: intelligentStore.selectedScenario.id }),
        });

        if (!response.ok) {
          throw new Error('获取部署图数据时网络响应错误');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setDeploymentData(data.deployment_data);
        } else {
          setDeploymentData(null);
          message.error('加载部署图失败: ' + (data.message || '未知错误'));
        }
      } catch (error) {
        console.error('获取部署图异常:', error);
        message.error(error.message || '获取部署图失败，请检查网络或联系管理员');
        setDeploymentData(null);
      }
    };
    
    fetchDeploymentData();
  }, [intelligentStore.selectedScenario]);

  // 未选择想定场景时的提示
  if (!intelligentStore.selectedScenario) {
    return (
      <Card
        style={{
          height: '100%',         // -> 卡片高度占满父容器
          display: 'flex',         // -> 启用Flexbox布局，用于居中
          justifyContent: 'center',// -> 内容水平居中
          alignItems: 'center',    // -> 内容垂直居中
        }}
      >
        <div style={{ color: '#999' /* -> 将文字颜色设为浅灰色 */ }}>
          请先在左侧选择一个想定场景
        </div>
      </Card>
    );
  }

  // 最终渲染的 JSX
  return (
    <Card
      title="场景部署图"
      bordered={false}
      style={{
        height: '100%',         // -> 卡片高度占满父容器
        display: 'flex',          // -> 启用Flexbox布局
        flexDirection: 'column',  // -> 子元素(卡片头和身体)从上到下垂直排列
      }}
    >
      <div
        style={{
          flex: 1,                  // -> 自动伸展并占据所有剩余的垂直空间
          display: 'flex',          // -> 启用Flexbox布局，用于居中内部元素
          justifyContent: 'center', // -> 内部元素水平居中
          alignItems: 'center',   // -> 内部元素垂直居中
          backgroundColor: '#fdfdfd',// -> 设置一个非常浅的灰色背景
          padding: '16px',          // -> 在容器内部添加16像素的边距
        }}
      >
        {deploymentData ? (
          <DeploymentCanvas deploymentData={deploymentData} width={800} height={600} />
        ) : (
          <div
            style={{
              color: '#999',       // -> 文字颜色设为浅灰色
              textAlign: 'center',  // -> 文字内容水平居中
            }}
          >
            <p>未能加载部署图。</p>
            <p>请确认该想定场景是否已正确配置部署信息。</p>
          </div>
        )}
      </div>
    </Card>
  );
});

export default Right;