// AgentEditor.jsx
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import StateVector from './StateVector';
import ActionSpace from './ActionSpace';
import RewardFunction from './RewardFunction';
import ModelButton from './ModelButton';
import './AgentEditor.css';

const AgentEditor = () => {
    const [scenarios, setScenarios] = useState([]);
    const [mockState, setMockState] = useState({});
    const [mockAction, setMockAction] = useState({});
    const [mockReward, setMockReward] = useState({});

    useEffect(() => {
        const mockData = {
            scenarioCount: 3,
            scenarios: [
                { name: '选项1', roleCount: 2,
                    agentRoles: [
                        { name: 'A', count: 1},
                        { name: 'B', count: 3}
                    ]
                },
                { name: '选项2', roleCount: 0, agentRoles: [] },
                { name: '选项3', roleCount: 0, agentRoles: [] }
            ]
        };
        setScenarios(mockData.scenarios);

        const mockStateData = {
            VectorCount: 11,
            Vectors: [
                {
                    VariableCount: 8,
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
                },
                ...Array(10).fill({ VariableCount: 0, Variables: [] })
            ]
        };
        setMockState(mockStateData);

        const mockActionData = {
            ActionCount: 11,
            Actions: [
                {
                    typeCount: 2,
                    types: [
                        {name: '移动', optionCount: 5, options:[
                                {name: '东', meaning: '向东移动'},
                                {name: '南', meaning: '向南移动'},
                                {name: '西', meaning: '向西移动'},
                                {name: '北', meaning: '向北移动'},
                                {name: '不动', meaning: '原地不动'}
                            ]},
                        {name: '其他', optionCount: 1, options: [
                                {name: '测试', meaning: ''}
                            ]}
                    ]
                },
                ...Array(10).fill({ typeCount: 0, types: [] })
            ]
        };
        setMockAction(mockActionData);

        const mockRewardData = {
            RewardCount: 11,
            Functions: [
                { name: '奖赏1', equation: 'R = x + y', meaning: '奖赏1的含义' },
                { name: '奖赏2', equation: 'R = x * y', meaning: '奖赏2的含义' },
                { name: '奖赏3', equation: 'R = x - y', meaning: '奖赏3的含义' },
                { name: '奖赏4', equation: 'R = x / y', meaning: '奖赏4的含义' },
                { name: '奖赏5', equation: 'R = x ^ y', meaning: '奖赏5的含义' },
                { name: '奖赏6', equation: 'R = x % y', meaning: '奖赏6的含义' },
                { name: '奖赏7', equation: 'R = x + y + z', meaning: '奖赏7的含义' },
                { name: '奖赏8', equation: 'R = x * y * z', meaning: '奖赏8的含义' },
                { name: '奖赏9', equation: 'R = x - y - z', meaning: '奖赏9的含义' },
                { name: '奖赏10', equation: 'R = x / y / z', meaning: '奖赏10的含义' },
                { name: '奖赏11', equation: 'R = x ^ y ^ z', meaning: '奖赏11的含义' }
            ]
        };
        setMockReward(mockRewardData);
    }, []);

    return (
        <div className="container">
            <Sidebar scenarios={scenarios} />
            <div className="gradient-box">
                <StateVector simulation={mockState} />
                <ActionSpace mockAction={mockAction} />
                <RewardFunction mockReward={mockReward} />
                <ModelButton />
            </div>
        </div>
    );
};

export default AgentEditor;