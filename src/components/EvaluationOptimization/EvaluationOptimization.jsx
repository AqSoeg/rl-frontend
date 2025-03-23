import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Button, Select } from 'antd';
import './EvaluationOptimization.css';

const { Option } = Select;

const EvaluationOptimization = () => {
    const [charts, setCharts] = useState([]);
    const [events, setEvents] = useState([]);
    const [radarImage, setRadarImage] = useState(null);
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
        { content: '', shape: '' },
        { content: '', shape: '' },
        { content: '', shape: '' },
        { content: '', shape: '' },
    ]);
    const [chartOptions, setChartOptions] = useState([]);
    const [selectedLegends, setSelectedLegends] = useState({});

    const chartRefs = useRef(Array(4).fill(null));
    const radarChartRef = useRef(null);

    useEffect(() => {
        chartRefs.current.forEach((_, index) => {
            const chartDom = document.getElementById(`chart-${index}`);
            if (chartDom) {
                chartRefs.current[index] = echarts.init(chartDom);
            }
        });

        if (radarChartRef.current) {
            const radarChart = echarts.init(radarChartRef.current);
            if (radarImage) {
                const radarOption = {
                    tooltip: {
                        trigger: 'item',
                        formatter: (params) => {
                            return params.value.map((v, i) =>
                                `${radarImage.indicator[i].name}：${v}`
                            ).join('<br>');
                        }
                    },
                    legend: {
                        data: Object.keys(radarImage.data),
                        bottom: 10
                    },
                    radar: {
                        indicator: radarImage.indicator,
                        shape: 'circle',
                        axisName: {
                            formatter: (name, indicator) =>
                                `${name}\n${indicator.max}`
                        }
                    },
                    series: [{
                        type: 'radar',
                        emphasis: {
                            lineStyle: {
                                width: 4
                            }
                        },
                        data: Object.entries(radarImage.data).map(([name, values]) => ({
                            name,
                            value: radarImage.indicator.map(ind => values[ind.name]),
                            lineStyle: {
                                type: 'dashed'
                            },
                            areaStyle: {
                                opacity: 0.3
                            }
                        }))
                    }]
                };
                radarChart.setOption(radarOption);
            }
        }

        return () => {
            chartRefs.current.forEach((chart) => chart && chart.dispose());
            if (radarChartRef.current) {
                echarts.dispose(radarChartRef.current);
            }
        };
    }, [radarImage, charts]);

    const updateChart = (index, content, shape) => {
        const chartData = chartOptions.find((item) => item.content === content);
        if (!chartData || !shape) return;

        const chart = chartRefs.current[index];
        if (!chart) return;

        const option = {
            tooltip: {},
            legend: {
                type: 'scroll',
                orient: 'horizontal',
                bottom: 0,
                selected: selectedLegends[index] || {},
                data: chartData.data_legend,
            },
            xAxis: {
                show: shape !== '饼图',
                type: 'category',
                name: chartData.x_label,
                nameLocation: 'center',
                nameGap: 25,
                data: [...new Set(chartData.chart_data.map((d) => d.x))],
            },
            yAxis: {
                show: shape !== '饼图',
                type: 'value',
                name: chartData.y_label,
                nameLocation: 'center',
                nameGap: 25,
            },
            series: [],
        };

        if (shape === '柱状图') {
            option.series = chartData.data_legend.map((legend) => ({
                type: 'bar',
                name: legend,
                data: chartData.chart_data
                    .filter((d) => d.legend === legend)
                    .map((d) => d.y),
                show: selectedLegends[index]?.[legend] !== false,
            }));
        } else if (shape === '折线图') {
            option.series = chartData.data_legend.map((legend) => ({
                type: 'line',
                name: legend,
                data: chartData.chart_data
                    .filter((d) => d.legend === legend)
                    .map((d) => d.y),
                show: selectedLegends[index]?.[legend] !== false,
            }));
        } else if (shape === '饼图') {
            option.xAxis.show = false;
            option.yAxis.show = false;
            option.legend = {
                show: true, // 可根据需求开启
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20
            };
            option.tooltip = {  // 新增tooltip配置
                trigger: 'item',
                formatter: ({ name, percent, value }) =>
                    `${name}<br/>占比: ${percent}%<br/>数值: ${value}`
            };
            option.series = [
                {
                    type: 'pie',
                    radius: '55%',
                    label: {  // 关闭外部标签
                        show: false
                    },
                    data: chartData.chart_data.map((d) => ({
                        name: `${d.x} - ${d.legend}`,
                        value: d.y
                    })),
                },
            ];
        }

        chart.setOption(option, true);
    };

    const handleLegendSelect = (index, selected) => {
        setSelectedLegends((prev) => ({
            ...prev,
            [index]: selected,
        }));
    };

    useEffect(() => {
        chartRefs.current.forEach((chart, index) => {
            if (!chart) return;

            chart.on('legendselectchanged', (params) => {
                handleLegendSelect(index, {
                    ...selectedLegends[index],
                    [params.name]: params.selected[params.name],
                });
            });
        });

        return () => {
            chartRefs.current.forEach((chart) => {
                chart?.off('legendselectchanged');
            });
        };
    }, [selectedLegends]);

    const handleLoadData = async () => {
        setChartSelections([
            { content: '', shape: '' },
            { content: '', shape: '' },
            { content: '', shape: '' },
            { content: '', shape: '' },
        ]);
        setChartOptions([]);
        setEvalScore(undefined);
        setEvalSuggestion([]);
        setRadarImage(null);
        setEvents([]);
        setCharts(Array(4).fill({ img: null }));

        if (!selectedEvaluationType) {
            alert('请先选择评估数据来源！');
        } else if (selectedEvaluationType === '在线评估') {
            try {
                const response = await fetch(__APP_CONFIG__.loadEvaluationData, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                scenarioParams: ['场景名称：离线交通', '数据来源：本地日志'],
                agentInfo: ['智能体名称：离线Agent', '版本：v2.0'],
                modelInfo: ['模型类型：离线决策'],
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
                    headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();

            setChartOptions(data.chart_data);
            setCharts(Array(4).fill({ img: null }));

            setEvents(data.event_data.map((content) => ({ content })));

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
        newSelections[index] = { content: value, shape: '' };
        setChartSelections(newSelections);
        updateChart(index, value, '');
    };

    const handleShapeChange = (index, value) => {
        const newSelections = [...chartSelections];
        newSelections[index].shape = value;
        setChartSelections(newSelections);
        updateChart(index, newSelections[index].content, value);
    };

    const getShapeOptions = (content) => {
        const target = chartOptions.find((item) => item.content === content);
        return target ? ['柱状图', '折线图', '饼图'] : [];
    };

    return (
        <div className="EO-container">
            <div className="EO-sidebar">
                <div className="EO-sidebar-section">
                    <div className="EO-text">评估数据来源</div>
                    <Select onChange={(value) => setSelectedEvaluationType(value)}>
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
                                        options={chartOptions.map((item) => ({
                                            label: item.content,
                                            value: item.content,
                                        }))}
                                        placeholder="选择内容"
                                    />
                                </div>

                                <div className="EO-evaluation">
                                    <p className="EO-text">形状：</p>
                                    <Select
                                        value={chartSelections[index].shape}
                                        onChange={(value) => handleShapeChange(index, value)}
                                        options={getShapeOptions(chartSelections[index].content).map((shape) => ({
                                            label: shape,
                                            value: shape,
                                        }))}
                                        placeholder="选择形状"
                                        disabled={!chartSelections[index].content}
                                    />
                                </div>

                                <div
                                    id={`chart-${index}`}
                                    style={{ width: '100%', height: '300px' }}
                                ></div>
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
                            <div
                                ref={radarChartRef}
                                style={{ width: '100%', height: '400px' }}
                            ></div>
                        </div>
                    )}

                    <div className="EO-evaluation-module">
                        <div className="EO-evaluation">
                            <div className="EO-text">分数评估：</div>
                            {evalScore && <div className="EO-score">{evalScore}</div>}
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