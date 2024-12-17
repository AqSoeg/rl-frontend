// AgentEditor.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import StateVector from './StateVector.jsx';
import ActionSpace from './ActionSpace.jsx';
import RewardFunction from "./RewardFunction.jsx";
import ModelFunction from './ModelButton.jsx';
import './AgentEditor.css';
import entityAssignmentStore from './EntityAssignmentStore'; // 引入实体分配状态管理

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [selectedEntities, setSelectedEntities] = useState([]); // 选中的实体

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

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} />
            <div className="gradient-box">
                <StateVector entities={selectedEntities} /> {/* 动态传递选中的实体 */}
                <ActionSpace entities={selectedEntities} /> {/* 动态传递选中的实体 */}
                {/*<RewardFunction />*/}
                <ModelFunction />
            </div>
        </div>
    );
};

export default AgentEditor;