import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Button, Select, Modal, Table, Space } from 'antd';
import './EvaluationOptimization.css';

const EvaluationOptimization = () => {
    const [charts, setCharts] = useState([]);
    const [events, setEvents] = useState([]);
    const [radarImage, setRadarImage] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [evalScore, setEvalScore] = useState();
    const [evalSuggestion, setEvalSuggestion] = useState([]);
    const [sidebarData, setSidebarData] = useState({
        scenarioInfo: {},
        agentInfo: {},
        modelInfo: {},
        trainInfo: {}
    });
    const [chartSelections, setChartSelections] = useState([
        { content: '', shape: '' },
        { content: '', shape: '' },
        { content: '', shape: '' },
        { content: '', shape: '' },
    ]);
    const [chartOptions, setChartOptions] = useState([]);
    const [selectedLegends, setSelectedLegends] = useState({});
    const [isDataModalVisible, setIsDataModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isModelListModalVisible, setIsModelListModalVisible] = useState(false);
    const [isEffectImageModalVisible, setIsEffectImageModalVisible] = useState(false);
    const [isModelInfoModalVisible, setIsModelInfoModalVisible] = useState(false);
    const [effectImageUrl, setEffectImageUrl] = useState(null);
    const [evaluationData, setEvaluationData] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [decisionModels, setDecisionModels] = useState([]);
    const [currentModel, setCurrentModel] = useState(null);

    const chartRefs = useRef(Array(4).fill(null));
    const radarChartRef = useRef(null);

    useEffect(() => {
        chartRefs.current = chartRefs.current.map((_, index) => {
            const chartDom = document.getElementById(`chart-${index}`);
            if (chartDom && !chartRefs.current[index]) {
                return echarts.init(chartDom);
            }
            return chartRefs.current[index];
        });

        const radarDom = radarChartRef.current;
        if (radarDom && !echarts.getInstanceByDom(radarDom)) {
            echarts.init(radarDom);
        }

        return () => {
            chartRefs.current.forEach((chart) => chart && chart.dispose());
            if (radarChartRef.current) {
                const radarChart = echarts.getInstanceByDom(radarChartRef.current);
                radarChart && radarChart.dispose();
            }
        };
    }, []);

    useEffect(() => {
        const radarDom = radarChartRef.current;
        if (radarDom) {
            const radarChart = echarts.getInstanceByDom(radarDom) || echarts.init(radarDom);
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
                radarChart.setOption(radarOption, true);
            } else {
                radarChart.clear();
            }
        }
    }, [radarImage]);

    useEffect(() => {
        chartRefs.current.forEach((chart, index) => {
            if (!chart) return;
            const { content, shape } = chartSelections[index];
            if (content && shape) {
                updateChart(index, content, shape);
            } else {
                chart.clear();
            }
        });
    }, [chartSelections, chartOptions, selectedLegends]);

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
                show: true,
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20
            };
            option.tooltip = {
                trigger: 'item',
                formatter: ({ name, percent, value }) =>
                    `${name}<br/>占比: ${percent}%<br/>数值: ${value}`
            };
            option.series = [
                {
                    type: 'pie',
                    radius: '55%',
                    label: { show: false },
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

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    };

    const handleLoadData = async () => {
        setEvaluationData([]);
        try {
            const response = await fetch(__APP_CONFIG__.loadEvaluationData, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            setEvaluationData(Array.isArray(data) ? data : [data]);
            setIsDataModalVisible(true);
        } catch (error) {
            console.error('数据载入失败:', error);
            alert(`数据载入失败：${error.message}`);
        }
    };

    const handleStartEvaluation = async () => {
        if (!dataLoaded) {
            alert('请先载入数据！');
            return;
        }
        try {
            const evalData = {
                model: sidebarData.modelInfo,
                scenario: sidebarData.scenarioInfo,
                agent: sidebarData.agentInfo,
                train: sidebarData.trainInfo
            };
            const modelId = sidebarData.modelInfo.id;
            const response = await fetch(__APP_CONFIG__.startEvaluation, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evalData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '评估请求失败');
            }

            const result = await response.text();
            alert(result);
            const resultResponse = await fetch(__APP_CONFIG__.loadEvaluationResult, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId: modelId
                }),
            });
            const data = await resultResponse.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setChartOptions(data.chart_data);
            setCharts(Array(4).fill({ img: null }));
            setEvents(data.event_data.map((content) => ({ content })));
            setRadarImage(data.radar_chart_data);
            setEvalScore(data.eval_score);
            setEvalSuggestion(data.eval_suggestion);
        } catch (error) {
            console.error('评估失败:', error);
            alert(`评估失败：${error.message}`);
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

    const handleViewModelList = async () => {
        try {
            const response = await fetch(__APP_CONFIG__.getDecisionModels, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error('Failed to fetch decision models');
            }
            const data = await response.json();
            setDecisionModels(data);
            setIsModelListModalVisible(true);
        } catch (error) {
            console.error('Error fetching decision models:', error);
            alert('获取决策模型列表失败！');
        }
    };

    const handleGenerate = async (record) => {
        try {
            const response = await fetch(__APP_CONFIG__.evaluateDataGenerate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decisionModel: record
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to generate evaluation data');
            }
            const data = await response.json();
            if (data.status === 'success') {
                alert('数据生成成功！');
            } else {
                alert('数据生成失败！');
            }
        } catch (error) {
            console.error('Error generating evaluation data:', error);
            alert('数据生成失败！');
        }
    };

    const handleEffectModel = async (record) => {
        try {
            const response = await fetch(__APP_CONFIG__.get_effect, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decisionModelID: record.model.id }),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.status === 'success') {
                setEffectImageUrl(data.img_url);
                setIsEffectImageModalVisible(true);
            } else {
                alert('获取效果图片失败，请检查日志！');
            }
        } catch (error) {
            console.error('获取效果图片失败:', error);
            alert('获取效果图片失败，请检查网络或联系管理员！');
        }
    };

    const handleViewModel = (model) => {
        setCurrentModel(model);
        setIsModelInfoModalVisible(true);
    };

    const dataColumns = [
        { title: '评估数据ID', dataIndex: ['model', 'id'], key: 'modelId' },
        { title: '模型名称', dataIndex: ['model', 'name'], key: 'modelName' },
        { title: '模型版本', dataIndex: ['model', 'version'], key: 'modelVersion' },
        { title: '模型类型', dataIndex: ['model', 'type'], key: 'modelType' },
        { title: '场景名称', dataIndex: ['scenario', 'name'], key: 'scenarioName' },
        { title: '智能体角色', dataIndex: ['agent', 'role'], key: 'agentRole' },
        {
            title: '创建时间',
            dataIndex: ['model', 'time'],
            key: 'createTime',
            render: (text) => formatDate(text),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        className="EO-modal-button"
                        onClick={() => {
                            setSelectedModel(record);
                            setIsDetailModalVisible(true);
                        }}
                    >
                        查看
                    </Button>
                    <Button
                        className="EO-modal-button"
                        onClick={() => {
                            setSelectedModel(record);
                            setCharts([]);
                            setEvents([]);
                            setRadarImage(null);
                            setEvalScore(undefined);
                            setEvalSuggestion([]);
                            setChartOptions([]);
                            setChartSelections([
                                { content: '', shape: '' },
                                { content: '', shape: '' },
                                { content: '', shape: '' },
                                { content: '', shape: '' },
                            ]);
                            setSelectedLegends({});
                            setSidebarData({
                                scenarioInfo: record.scenario,
                                agentInfo: record.agent,
                                modelInfo: record.model,
                                trainInfo: record.train
                            });
                            setDataLoaded(true);
                            setIsDataModalVisible(false);
                        }}
                    >
                        载入
                    </Button>
                </Space>
            ),
        },
    ];

    const modelListColumns = [
        { title: '决策模型ID', dataIndex: ['model', 'id'], key: 'modelId' },
        { title: '决策模型名称', dataIndex: ['model', 'name'], key: 'modelName' },
        { title: '场景名称', dataIndex: ['scenario', 'name'], key: 'scenarioName' },
        { title: '角色名称', dataIndex: ['agent', 'role'], key: 'roleName' },
        { title: '模型版本', dataIndex: ['model', 'version'], key: 'modelVersion' },
        { title: '模型类型', dataIndex: ['model', 'type'], key: 'modelType' },
        {
            title: '创建时间',
            dataIndex: ['model', 'time'],
            key: 'createTime',
            render: time => new Date(time).toLocaleString()
        },
        {
            title: '发布状态',
            dataIndex: ['model', 'state'],
            key: 'state',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        className="EO-modal-button"
                        onClick={() => handleViewModel(record)}
                    >
                        查看
                    </Button>
                    <Button
                        className="EO-modal-button"
                        onClick={() => handleEffectModel(record)}
                    >
                        效果
                    </Button>
                    <Button
                        className="EO-modal-button"
                        onClick={() => handleGenerate(record)}
                    >
                        生成
                    </Button>
                </Space>
            ),
        },
    ];

    const envParamsColumns = [
        {
            title: '角色名称',
            dataIndex: 'role',
            key: 'role',
            render: (_, record) => Object.keys(record)[0],
        },
        {
            title: '变量数值',
            dataIndex: 'params',
            key: 'params',
            render: (_, record) => {
                const params = record[Object.keys(record)[0]];
                return params.map((param, idx) => (
                    <div key={idx}>
                        {Object.entries(param).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </div>
                ));
            },
        },
    ];

    const entityAssignmentsColumns = [
        {
            title: '智能体名称',
            dataIndex: 'agent',
            key: 'agent',
            render: (_, record) => Object.keys(record)[0]
        },
        {
            title: '分配实体',
            dataIndex: 'entities',
            key: 'entities',
            render: (_, record) => record[Object.keys(record)[0]].join(', ')
        },
    ];

    const hyperParamsColumns = [
        {
            title: '超参数名称',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => Object.keys(record)[0]
        },
        {
            title: '数值',
            dataIndex: 'value',
            key: 'value',
            render: (_, record) => record[Object.keys(record)[0]]
        },
    ];

    return (
        <div className="EO-container">
            <div className="EO-sidebar">
                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">场景信息</div>
                    {sidebarData.scenarioInfo.name && (
                        <>
                            <div className="EO-info-item">名称: {sidebarData.scenarioInfo.name}</div>
                            <div className="EO-info-item">描述: {sidebarData.scenarioInfo.description}</div>
                            <Table
                                columns={envParamsColumns}
                                dataSource={sidebarData.scenarioInfo.envParams}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </>
                    )}
                </div>

                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">智能体信息</div>
                    {sidebarData.agentInfo.role && (
                        <>
                            <div className="EO-info-item">角色: {sidebarData.agentInfo.role}</div>
                            <div className="EO-info-item">类型: {sidebarData.agentInfo.type}</div>
                            <div className="EO-info-item">数量: {sidebarData.agentInfo.count}</div>
                            <Table
                                columns={entityAssignmentsColumns}
                                dataSource={sidebarData.agentInfo.entityAssignments}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </>
                    )}
                </div>

                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">决策模型信息</div>
                    {sidebarData.modelInfo.id && (
                        <>
                            <div className="EO-info-item">模型ID: {sidebarData.modelInfo.id}</div>
                            <div className="EO-info-item">模型名称: {sidebarData.modelInfo.name}</div>
                            <div className="EO-info-item">模型版本: {sidebarData.modelInfo.version}</div>
                            <div className="EO-info-item">模型类型: {sidebarData.modelInfo.type}</div>
                            <div className="EO-info-item">创建时间: {formatDate(sidebarData.modelInfo.time)}</div>
                        </>
                    )}
                </div>

                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">训练信息</div>
                    {sidebarData.trainInfo.algorithm && (
                        <>
                            <div className="EO-info-item">训练算法: {sidebarData.trainInfo.algorithm}</div>
                            <Table
                                columns={hyperParamsColumns}
                                dataSource={sidebarData.trainInfo.hyperParams}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </>
                    )}
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
                        <Button className="EO-model-button" onClick={handleViewModelList}>数据生成</Button>
                        <Button className="EO-model-button" onClick={handleLoadData}>数据载入</Button>
                        <Button className="EO-model-button" onClick={handleStartEvaluation}>开始评估</Button>
                    </div>
                </div>
            </div>

            <Modal
                title="请选择需要评估的数据来源"
                open={isDataModalVisible}
                onCancel={() => setIsDataModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={dataColumns}
                    dataSource={evaluationData}
                    pagination={false}
                    rowKey={(record) => record.model.id}
                />
            </Modal>

            <Modal
                title="数据详细信息"
                open={isDetailModalVisible}
                onCancel={() => setIsDetailModalVisible(false)}
                footer={null}
                width={800}
                className="EO-detail-modal"
            >
                {selectedModel && (
                    <div className="EO-detail-content">
                        <div className="EO-detail-section">
                            <div className="EO-text">决策模型信息</div>
                            <div className="EO-info-item">模型ID: {selectedModel.model.id}</div>
                            <div className="EO-info-item">模型名称: {selectedModel.model.name}</div>
                            <div className="EO-info-item">模型版本: {selectedModel.model.version}</div>
                            <div className="EO-info-item">模型类型: {selectedModel.model.type}</div>
                            <div className="EO-info-item">创建时间: {formatDate(selectedModel.model.time)}</div>
                        </div>
                        <div className="EO-detail-section">
                            <div className="EO-text">场景信息</div>
                            <div className="EO-info-item">名称: {selectedModel.scenario.name}</div>
                            <div className="EO-info-item">描述: {selectedModel.scenario.description}</div>
                            <Table
                                columns={envParamsColumns}
                                dataSource={selectedModel.scenario.envParams}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </div>
                        <div className="EO-detail-section">
                            <div className="EO-text">智能体信息</div>
                            <div className="EO-info-item">角色: {selectedModel.agent.role}</div>
                            <div className="EO-info-item">类型: {selectedModel.agent.type}</div>
                            <div className="EO-info-item">数量: {selectedModel.agent.count}</div>
                            <Table
                                columns={entityAssignmentsColumns}
                                dataSource={selectedModel.agent.entityAssignments}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </div>
                        <div className="EO-detail-section">
                            <div className="EO-text">训练信息</div>
                            <div className="EO-info-item">训练算法: {selectedModel.train.algorithm}</div>
                            <Table
                                columns={hyperParamsColumns}
                                dataSource={selectedModel.train.hyperParams}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title="模型列表"
                open={isModelListModalVisible}
                onCancel={() => setIsModelListModalVisible(false)}
                footer={null}
                width={1000}
            >
                <Table
                    columns={modelListColumns}
                    dataSource={decisionModels}
                    pagination={false}
                    rowKey={(record) => record.model.id}
                />
            </Modal>

            <Modal
                title="模型详细信息"
                open={isModelInfoModalVisible}
                onCancel={() => setIsModelInfoModalVisible(false)}
                footer={null}
            >
                {currentModel && (
                    <div>
                        <p><strong>决策模型ID：</strong>{currentModel.model.id}</p>
                        <p><strong>智能体名称：</strong>{currentModel.model.name}</p>
                        <p><strong>场景名称：</strong>{currentModel.scenario.name}</p>
                        <p><strong>角色名称：</strong>{currentModel.agent.role}</p>
                        <p><strong>模型版本：</strong>{currentModel.model.version}</p>
                        <p><strong>模型类型：</strong>{currentModel.model.type}</p>
                        <p><strong>创建时间：</strong>{new Date(currentModel.model.time).toLocaleString()}</p>
                        <p><strong>模型存放路径：</strong>{currentModel.model.path || '未提供'}</p>
                        <p><strong>模型效果图路径：</strong>{currentModel.model.img_url || '未提供'}</p>
                    </div>
                )}
            </Modal>

            <Modal
                title="训练效果图片"
                open={isEffectImageModalVisible}
                onCancel={() => setIsEffectImageModalVisible(false)}
                footer={null}
            >
                {effectImageUrl && <img src={effectImageUrl} alt="训练效果图片" style={{ width: '100%' }} />}
            </Modal>
        </div>
    );
};

export default EvaluationOptimization;