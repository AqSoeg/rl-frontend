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
          body: JSON.stringify({
            scenarioEditInfo: {
              scenarioName: intelligentStore.selectedScenario.name,
              // agentRoleName: intelligentStore.selectedAgentRole.name,
              env_params: intelligentStore.selectedScenario.env_params.map(param => ({
                id: param.id,
                name: param.name,
                params: param.params.map(p => ({
                  key: p[0],
                  label: p[1],
                  value: p[2]
                }))
              }))
            }
          }),
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

  if (!intelligentStore.selectedScenario) {
    return (
      <Card className="placeholder-card">
        <div className="placeholder-text">
          请先在左侧选择一个想定场景
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="场景部署图"
      bordered={false}
      className="deployment-card"
    >
      <div className="deployment-canvas-container">
        {deploymentData ? (
          <DeploymentCanvas deploymentData={deploymentData} width={800} height={600} />
        ) : (
          <div className="deployment-error-text">
            <p>未能加载部署图。</p>
            <p>请确认该想定场景是否已正确配置部署信息。</p>
          </div>
        )}
      </div>
    </Card>
  );
});

export default Right;