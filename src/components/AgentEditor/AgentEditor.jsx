import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StateVector from './StateVector';
import ActionSpace from './ActionSpace';
import RewardFunction from './RewardFunction';
import ModelButton from './ModelButton';
import './AgentEditor.css';
import stateVector from "./StateVector"; // 引入 CSS 文件

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);

    useEffect(() => {
        const mockData = {
            scenarioCount: 3,
            scenarios: [
                { name: '选项1', roleCount: 2,
                    agentRoles: [
                        { name: 'A', count: 1, states: {VectorCount: 11, Vectors: []}},
                        { name: 'B', count: 3,
                            states: {
                                VectorCount: 2,
                                Vectors: [
                                    {VariableCount: 8,
                                        Variables: [
                                            {name: 'r1', info: 'xx距离', unit: 'km'},
                                            {name: 'r2', info: 'aaa距离', unit: 'km'},
                                            {name: 'r3', info: 'bbb距离', unit: 'km'},
                                            {name: 'r4', info: 'cc与dd的距离', unit: 'km'},
                                            {name: 'uv', info: 'aa速度', unit: 'm/s'},
                                            {name: 'pv', info: 'bb速度', unit: 'm/s'},
                                            {name: 'u', info: 'aa油量', unit: 'L'},
                                            {name: 'rs', info: 'ddd范围', unit: 'km'}
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                { name: '选项2', roleCount: 0, agentRoles: [] },
                { name: '选项3', roleCount: 0, agentRoles: [] }
            ]
        };
        setScenarios(mockData.scenarios);
    }, []);

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} />
            <div className="gradient-box">
            <StateVector />
            <ActionSpace />
            <RewardFunction />
            <ModelButton />
            </div>
        </div>
    );
};

export default AgentEditor;