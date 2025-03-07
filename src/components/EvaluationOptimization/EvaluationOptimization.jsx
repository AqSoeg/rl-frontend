// components/EvaluationOptimization/EvaluationOptimization.jsx
import { useState, useEffect } from 'react';
import './EvaluationOptimization.css';

const EvaluationOptimization = () => {
    // 评估模式状态
    const [evalMode, setEvalMode] = useState('online');
    // 数据状态
    const [chartData, setChartData] = useState(null);
    const [eventData, setEventData] = useState([]);
    const [radarData, setRadarData] = useState(null);
    const [score, setScore] = useState(0);
    const [suggestions, setSuggestions] = useState([]);

    // 轮询相关状态
    const [polling, setPolling] = useState(false);

    // 模拟API请求
    const fetchData = async (mode) => {
        // 实际应替换为axios/fetch请求
        return new Promise(resolve => setTimeout(() => {
            resolve({
                chart_data: { /* 图表数据结构 */ },
                event_data: ["事件1: 系统初始化完成", "事件2: 数据采样开始"],
                radar_chart_data: { /* 雷达图数据 */ },
                eval_score: 85,
                eval_suggestion: ["建议1: 优化决策模型参数", "建议2: 增加训练数据多样性"]
            });
        }, 1000));
    };

    // 处理数据载入
    const handleDataLoad = async () => {
        try {
            const response = await fetchData(evalMode);
            setEventData(response.event_data);
            setRadarData(response.radar_chart_data);
            setScore(response.eval_score);
            setSuggestions(response.eval_suggestion);
        } catch (error) {
            console.error('数据载入失败:', error);
        }
    };

    // 轮询效果
    useEffect(() => {
        let interval;
        if (polling && evalMode === 'online') {
            interval = setInterval(async () => {
                const newData = await fetchData('online');
                setChartData(prev => ({ ...prev, ...newData.chart_data }));
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [polling, evalMode]);

    return (
        <div className="EO-container">
            {/* 左侧栏 */}
            <div className="EO-sidebar">
                <div className="EO-modeSelector">
                    <button
                        className={`EO-modeButton ${evalMode === 'online' ? 'EO-active' : ''}`}
                        onClick={() => setEvalMode('online')}
                    >
                        在线评估
                    </button>
                    <button
                        className={`EO-modeButton ${evalMode === 'offline' ? 'EO-active' : ''}`}
                        onClick={() => setEvalMode('offline')}
                    >
                        离线评估
                    </button>
                </div>

                <div className="EO-controlPanel">
                    <button className="EO-loadButton" onClick={handleDataLoad}>
                        数据载入
                    </button>
                    <button
                        className="EO-startButton"
                        onClick={() => setPolling(!polling)}
                    >
                        {polling ? '停止评估' : '开始评估'}
                    </button>
                </div>

                <InfoPanel evalMode={evalMode} />
            </div>

            {/* 中间主区域 */}
            <div className="EO-mainContent">
                <ChartSection data={chartData} />
                <EventList events={eventData} />
            </div>

            {/* 右侧栏 */}
            <div className="EO-sidebar">
                <RadarChart data={radarData} />
                <EvaluationResult score={score} suggestions={suggestions} />
            </div>
        </div>
    );
};

// 信息显示面板子组件
const InfoPanel = ({ evalMode }) => (
    <div className="EO-infoPanel">
        <h3>场景参数</h3>
        <p>当前模式: {evalMode === 'online' ? '实时场景' : '历史场景'}</p>

        <h3>智能体信息</h3>
        <p>版本: v2.1.3</p>

        <h3>决策模型</h3>
        <p>类型: 深度强化学习</p>
    </div>
);

// 图表区域子组件
const ChartSection = ({ data }) => (
    <div className="EO-chartArea">
        {/* 这里应集成图表库组件 */}
        <div className="EO-chartPlaceholder">图表区域</div>
    </div>
);

// 事件列表子组件
const EventList = ({ events }) => (
    <div className="EO-eventList">
        <h4>事件日志</h4>
        {events.map((event, index) => (
            <div key={index} className="EO-eventItem">{event}</div>
        ))}
    </div>
);

// 雷达图子组件
const RadarChart = ({ data }) => (
    <div className="EO-radarChart">
        {/* 这里应集成雷达图组件 */}
        <div className="EO-chartPlaceholder">雷达图区域</div>
    </div>
);

// 评估结果子组件
const EvaluationResult = ({ score, suggestions }) => (
    <div className="EO-resultPanel">
        <h3>综合评分: {score}</h3>
        <h4>优化建议:</h4>
        <ul>
            {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
            ))}
        </ul>
    </div>
);

export default EvaluationOptimization;