import React, { useEffect } from 'react';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';

const RighT = observer(() => {
  useEffect(() => {
    // 当想定场景改变时，重置智能体角色的详情信息
    intelligentStore.selectedAgentRole = null;
  }, [intelligentStore.selectedScenario]);
  useEffect(() => {
    // 当算法类型改变时，重置算法的详情信息
    if (!intelligentStore.selectedAlgorithm) {
      // 这里可以添加逻辑来清除算法详情信息
    }
  }, [intelligentStore.selectedAlgorithm]);
  return (
    <div className='right'>
      <h3>已选算法详情</h3>
      {intelligentStore.selectedAlgorithm ? (
        <div>
          <p><strong>名称:</strong> {intelligentStore.selectedAlgorithm.name}</p>
          <p><strong>类型:</strong> {intelligentStore.selectedAlgorithm.type}</p>
          <p><strong>描述:</strong> {intelligentStore.selectedAlgorithm.description || '无描述'}</p>
          <p><strong>版本:</strong> {intelligentStore.selectedAlgorithm.version || '未知版本'}</p>
        </div>
      ) : (
        <p>请选择一个算法</p>
      )}

      <hr />

      <h3>已选想定场景详情</h3>
      {intelligentStore.selectedScenario ? (
        <div>
          <p><strong>名称:</strong> {intelligentStore.selectedScenario.name}</p>
          <p><strong>ID:</strong> {intelligentStore.selectedScenario.id || '未知ID'}</p>
          <p><strong>描述:</strong> {intelligentStore.selectedScenario.description || '无描述'}</p>
        </div>
      ) : (
        <p>请选择一个想定场景</p>
      )}

      <hr />

      <h3>已选智能体角色详情</h3>
      {intelligentStore.selectedAgentRole ? (
        <div>
          <p><strong>ID:</strong> {intelligentStore.selectedAgentRole.id || '未知ID'}</p>
          <p><strong>名称:</strong> {intelligentStore.selectedAgentRole.name || '未知ID'}</p>
        </div>
      ) : (
        <p>请选择一个想定场景</p>
      )}
    </div>
  );
});

export default RighT;