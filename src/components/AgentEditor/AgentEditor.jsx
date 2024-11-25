import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StateVector from './StateVector';
import ActionSpace from './ActionSpace';
import RewardFunction from './RewardFunction';
import ModelButton from './ModelButton';

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);

    useEffect(() => {
        const mockData = {
            scenarioCount: 3,
            scenarios: [
                { name: '选项1', roleCount: 2, agentRoles: [{ name: 'A', count: 1 }, { name: 'B', count: 3 }] },
                { name: '选项2', roleCount: 0, agentRoles: [] },
                { name: '选项3', roleCount: 0, agentRoles: [] }
            ]
        };
        setScenarios(mockData.scenarios);
    }, []);

    return (
        <div className="flex h-screen">
            {/* 侧边栏固定长度和宽度 */}
            <div className="w-80">
                <Sidebar scenarios={scenarios} />
            </div>
            {/* 其余三列均匀分布，宽度随窗口变化而变化 */}
            <div className="flex-1 flex flex-col bg-gradient-to-b from-blue-100 to-gray-100">
                <div className="flex-1 flex">
                    <StateVector />
                    <ActionSpace />
                    <RewardFunction />
                </div>
                <div className="flex flex-col justify-end p-4">
                    <ModelButton />
                </div>
            </div>
        </div>
    );
};

export default AgentEditor;