import {useState} from 'react';
import {Button, Select} from 'antd';
import './EvaluationOptimization.css';

const {Option} = Select;

const EvaluationOptimization = () => {
    const [charts, setCharts] = useState([]);
    const [events, setEvents] = useState([]);
    const [radarImage, setRadarImage] = useState('');
    const [dataLoaded, setDataLoaded] = useState(false);
    const [evalScore, setEvalScore] = useState();
    const [evalSuggestion, setEvalSuggestion] = useState([]);
    const [sidebarData, setSidebarData] = useState({
        scenarioParams: [],
        agentInfo: [],
        modelInfo: []
    });
    const [selectedEvaluationType, setSelectedEvaluationType] = useState();
    const [chartSelections, setChartSelections] = useState([
        {content: '', shape: ''},
        {content: '', shape: ''},
        {content: '', shape: ''},
        {content: '', shape: ''}
    ]);
    const [chartOptions, setChartOptions] = useState([]);

    const handleLoadData = async () => {
        setChartSelections([
            {content: '', shape: ''},
            {content: '', shape: ''},
            {content: '', shape: ''},
            {content: '', shape: ''}
        ]);
        setChartOptions([]);
        setEvalScore(undefined);
        setEvalSuggestion([]);
        setRadarImage('');
        setEvents([]);
        setCharts(Array(4).fill({img: null}));

        if (!selectedEvaluationType) {
            alert('请先选择评估数据来源！');
        } else if (selectedEvaluationType === '在线评估') {
            try {
                const response = await fetch(__APP_CONFIG__.loadEvaluationData, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'}
                });
                const data = await response.json();

                setSidebarData({
                    scenarioParams: data.scenario_params,
                    agentInfo: data.agent_info,
                    modelInfo: data.model_info
                });
                setDataLoaded(true);
            } catch (error) {
                console.error('数据载入失败:', error);
                alert('数据载入失败，请检查网络连接！');
            }
        } else {
            const localData = {
                scenarioParams: ["场景名称：离线交通", "数据来源：本地日志"],
                agentInfo: ["智能体名称：离线Agent", "版本：v2.0"],
                modelInfo: ["模型类型：离线决策"]
            };
            setSidebarData(localData);
            setDataLoaded(true);
        }
    };

    const handleStartEvaluation = async () => {
        if (!dataLoaded) {
            alert('请先载入数据！');
            return;
        }
        if (selectedEvaluationType === '离线评估') {
            try {
                const response = await fetch(__APP_CONFIG__.offlineEvaluation, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(sidebarData)
                });
                const result = await response.text();
                alert(result);
            } catch (error) {
                console.error('数据发送失败:', error);
                alert('数据发送失败，请检查网络连接！');
            }
        }

        try {
            const response = await fetch(__APP_CONFIG__.startEvaluation, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const data = await response.json();

            setChartOptions(data.chart_data);
            setCharts(Array(4).fill({img: null}));

            setEvents(data.event_data.map(content => ({content})));

            setRadarImage(data.radar_chart_data);

            setEvalScore(data.eval_score);
            setEvalSuggestion(data.eval_suggestion);
        } catch (error) {
            console.error('评估失败:', error);
            alert('评估请求失败，请稍后重试！');
        }
    };

    const handleContentChange = (index, value) => {
        const newSelections = [...chartSelections];
        newSelections[index] = {content: value, shape: ''};
        setChartSelections(newSelections);
        updateChartImage(index, value, '');
    };

    const handleShapeChange = (index, value) => {
        const newSelections = [...chartSelections];
        newSelections[index].shape = value;
        setChartSelections(newSelections);
        updateChartImage(index, newSelections[index].content, value);
    };

    const updateChartImage = (index, content, shape) => {
        if (!content || !shape) {
            setCharts(prev => {
                const newCharts = [...prev];
                newCharts[index] = {img: null};
                return newCharts;
            });
            return;
        }

        const contentData = chartOptions.find(item => item.content === content);
        const shapeData = contentData.chart_data.find(item => item.shape === shape);

        setCharts(prev => {
            const newCharts = [...prev];
            newCharts[index] = {img: shapeData.base64};
            return newCharts;
        });
    };

    const getShapeOptions = (content) => {
        const target = chartOptions.find(item => item.content === content);
        return target ? target.chart_data.map(item => item.shape) : [];
    };

    return (
        <div className="EO-container">
            <div className="EO-sidebar">
                <div className="EO-sidebar-section">
                    <div className="EO-text">评估数据来源</div>
                    <Select onChange={value => setSelectedEvaluationType(value)}>
                        <Option value="在线评估">在线评估</Option>
                        <Option value="离线评估">离线评估</Option>
                    </Select>
                </div>

                <div className="EO-sidebar-section">
                    <div className="EO-text">场景参数</div>
                    {sidebarData.scenarioParams.map((param, index) => (
                        <div key={index}>{param}</div>
                    ))}
                </div>

                <div className="EO-sidebar-section">
                    <div className="EO-text">智能体信息</div>
                    {sidebarData.agentInfo.map((info, index) => (
                        <div key={index}>{info}</div>
                    ))}
                </div>

                <div className="EO-sidebar-section">
                    <div className="EO-text">决策模型信息</div>
                    {sidebarData.modelInfo.map((info, index) => (
                        <div key={index}>{info}</div>
                    ))}
                </div>
            </div>

            <div className="EO-gradient-box">
                <div className="EO-middle-container">
                    <div className="EO-chart-grid">
                        {[0, 1, 2, 3].map((index) => (
                            <div key={index} className="EO-chart-item">
                                <p className="EO-text">图 {index + 1}</p>
                                <div className="EO-evaluation">
                                    <p className="EO-text">内容：</p>
                                    <Select
                                        value={chartSelections[index].content}
                                        onChange={(value) => handleContentChange(index, value)}
                                        options={chartOptions.map(item => ({
                                            label: item.content,
                                            value: item.content
                                        }))}
                                        placeholder="选择内容"
                                    />
                                </div>

                                <div className="EO-evaluation">
                                    <p className="EO-text">形状：</p>
                                    <Select
                                        value={chartSelections[index].shape}
                                        onChange={(value) => handleShapeChange(index, value)}
                                        options={getShapeOptions(chartSelections[index].content).map(shape => ({
                                            label: shape,
                                            value: shape
                                        }))}
                                        placeholder="选择形状"
                                        disabled={!chartSelections[index].content}
                                    />
                                </div>

                                {charts[index]?.img && (
                                    <img
                                        src={`data:image/png;base64,${charts[index].img}`}
                                        alt={`图表${index + 1}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="EO-text">事件：</div>
                    <div className="EO-event-log">
                        {events.map((event, i) => (
                            <div key={i} className="EO-event-item">
                                <span>事件{i + 1}：{event.content}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="EO-right-panel">
                    {radarImage && (
                        <div className="EO-radar-chart-container">
                            <img src={`data:image/jpeg;base64,${radarImage}`} alt="雷达图"/>
                        </div>
                    )}

                    <div className="EO-evaluation-module">
                        <div className="EO-evaluation">
                            <div className="EO-text">分数评估：</div>
                            {evalScore && (<div className="EO-score">{evalScore}</div>)}
                        </div>


                        <div>
                            <div className="EO-text">优化评估：</div>
                            {evalSuggestion && (
                                <div className="EO-optimization-suggestion">
                                    {evalSuggestion.map((suggestion, index) => (
                                        <div key={index} className="EO-suggestion-item">{suggestion}</div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="EO-model-button-container">
                        <Button className="EO-model-button" onClick={handleLoadData}>数据载入</Button>
                        <Button className="EO-model-button" onClick={handleStartEvaluation}>开始评估</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationOptimization;