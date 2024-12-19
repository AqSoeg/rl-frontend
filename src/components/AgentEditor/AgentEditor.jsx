import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import StateVector from './StateVector.jsx';
import ActionSpace from './ActionSpace.jsx';
import ModelFunction from './ModelButton.jsx';
import './AgentEditor.css';
import entityAssignmentStore from './EntityAssignmentStore'; // 引入实体分配状态管理

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]); // 选中的实体

    // 页面加载时清空 entityAssignmentStore 的状态
    useEffect(() => {
        entityAssignmentStore.clearAssignment(); // 清空实体分配状态
    }, []);

    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const response = await axios.get('http://localhost:3000/scenarios');
                setScenarios(response.data);
            } catch (error) {
                console.error('Error fetching scenarios:', error);
            }
        };

        fetchScenarios();
    }, []);

    useEffect(() => {
        // 监听实体分配状态的变化
        const updateSelectedEntities = () => {
            const selectedAgent = entityAssignmentStore.selectedAgent;
            if (selectedAgent) {
                const assignedEntities = entityAssignmentStore.assignedEntities[selectedAgent] || [];
                // 获取实体的完整数据
                const fullEntities = scenarios
                    .flatMap(scenario => scenario.roles)
                    .flatMap(role => role.entities)
                    .filter(entity => assignedEntities.includes(entity.name));
                setSelectedEntities(fullEntities);
            } else {
                setSelectedEntities([]);
            }
        };

        updateSelectedEntities();

        // 订阅实体分配状态的变化
        const unsubscribe = entityAssignmentStore.subscribe(updateSelectedEntities);

        // 组件卸载时取消订阅
        return () => unsubscribe();
    }, [scenarios]);

    // 定义 onEntitiesChange 函数
    const handleEntitiesChange = (entities) => {
        setSelectedEntities(entities);
    };

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} onEntitiesChange={handleEntitiesChange} /> {/* 传递 onEntitiesChange */}
            <div className="gradient-box">
                <StateVector entities={selectedEntities} /> {/* 动态传递选中的实体 */}
                <ActionSpace entities={selectedEntities} /> {/* 动态传递选中的实体 */}
                <ModelFunction scenarios={scenarios} /> {/* 传递 scenarios */}
            </div>
        </div>
    );
};

export default AgentEditor;