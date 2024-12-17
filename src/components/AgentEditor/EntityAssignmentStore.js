import { useState, useEffect } from 'react';

const EntityAssignmentStore = () => {
    const [assignedEntities, setAssignedEntities] = useState({}); // 保存分配的实体
    const [currentAgent, setCurrentAgent] = useState(null); // 当前选中的智能体模型

    // 更新分配的实体
    const updateAssignedEntities = (agent, entities) => {
        setAssignedEntities(prev => ({
            ...prev,
            [agent]: entities,
        }));
    };

    // 清空分配的实体
    const clearAssignedEntities = () => {
        setAssignedEntities({});
        setCurrentAgent(null);
    };

    // 切换当前选中的智能体模型
    const switchAgent = (agent) => {
        setCurrentAgent(agent);
    };

    // 获取当前选中的实体
    const getCurrentEntities = () => {
        if (currentAgent && assignedEntities[currentAgent]) {
            return assignedEntities[currentAgent];
        }
        return [];
    };

    // 清空当前选中的实体
    const clearCurrentEntities = () => {
        setCurrentAgent(null);
    };

    return {
        assignedEntities,
        currentAgent,
        updateAssignedEntities,
        clearAssignedEntities,
        switchAgent,
        getCurrentEntities,
        clearCurrentEntities,
    };
};

export default EntityAssignmentStore;