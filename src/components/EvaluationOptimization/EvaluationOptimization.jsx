import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Button, Select, Modal, Table, Space, InputNumber } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import './EvaluationOptimization.css';

const EvaluationOptimization = () => {
    const [charts, setCharts] = useState([]);
    const [events, setEvents] = useState([]);
    const [radarImage, setRadarImage] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [evalScore, setEvalScore] = useState();
    const [evalSuggestion, setEvalSuggestion] = useState([]);
    const [sidebarData, setSidebarData] = useState({
        evaluateDataInfo: {},
        scenarioInfo: {},
        modelInfo: {},
        algorithmInfo: {}
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
    const [isEpisodesModalVisible, setIsEpisodesModalVisible] = useState(false);
    const [effectImageUrl, setEffectImageUrl] = useState(null);
    const [evaluationData, setEvaluationData] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [decisionModels, setDecisionModels] = useState([]);
    const [currentModel, setCurrentModel] = useState(null);
    const [selectedSubModel, setSelectedSubModel] = useState(null);
    const [episodes, setEpisodes] = useState(100);

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
            setEvaluationData(Array.isArray(data) ? data.map(item => item.evaluateData) : [data.evaluateData]);
            setIsDataModalVisible(true);
        } catch (error) {
            console.error('数据载入失败:', error);
            alert(`数据载入失败：${error.message}`);
        }
    };

    const handleViewEvaluationData = async (record) => {
        try {
            const response = await fetch(__APP_CONFIG__.viewEvaluationData, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role_name: record.role_name,
                    scenario_name: record.scenario_name,
                    agentID: record.agentID,
                    trainID: record.trainID
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch evaluation data');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setSelectedModel({
                model_info: data.model,
                scenario_info: {
                    name: data.model.scenario_name,
                    role_name: data.model.role_name,
                    agent_id: data.model.agentID,
                    env_params: data.env_param
                },
                algorithm_info: {
                    id: data.algorithm.id,
                    name: data.algorithm.name,
                    type: data.algorithm.mode,
                    hyper_params: data.algorithm['hyper-parameters']
                }
            });
            setIsDetailModalVisible(true);
        } catch (error) {
            console.error('获取评估数据失败:', error);
            alert('获取评估数据失败！');
        }
    };

    const handleLoadEvaluationData = async (record, subModelId, dataFile) => {
        try {
            const response = await fetch(__APP_CONFIG__.viewEvaluationData, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role_name: record.role_name,
                    scenario_name: record.scenario_name,
                    agentID: record.agentID,
                    trainID: record.trainID
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch evaluation data');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            setSidebarData({
                evaluateDataInfo: {
                    id: record.id,
                    evaluateData_path: record.evaluateData_path,
                    select_evaluateData: subModelId,
                    dataFile: dataFile,
                    time: record.time
                },
                scenarioInfo: {
                    name: data.model.scenario_name,
                    role_name: data.model.role_name,
                    agent_id: data.model.agentID,
                    env_params: Object.entries(data.env_param).map(([key, value]) => ({ [key]: value }))
                },
                modelInfo: data.model,
                algorithmInfo: {
                    id: data.algorithm.id,
                    name: data.algorithm.name,
                    type: data.algorithm.mode,
                    hyperParams: Object.entries(data.algorithm['hyper-parameters']).map(([key, value]) => ({ [key]: value }))
                }
            });
            setDataLoaded(true);
            setIsDataModalVisible(false);
        } catch (error) {
            console.error('载入评估数据失败:', error);
            alert('载入评估数据失败！');
        }
    };

    const handleStartEvaluation = async () => {
        if (!dataLoaded) {
            alert('请先载入数据！');
            return;
        }
        try {
            const evalData = {
                evaluateData: {
                    id: sidebarData.evaluateDataInfo.id,
                    img_url: sidebarData.modelInfo.img_url,
                    model_path: sidebarData.modelInfo.model_path,
                    evaluateData_path: sidebarData.evaluateDataInfo.evaluateData_path,
                    select_evaluateData: [sidebarData.evaluateDataInfo.dataFile, sidebarData.evaluateDataInfo.select_evaluateData],
                    name: sidebarData.modelInfo.name,
                    nn_model_type: sidebarData.modelInfo.nn_model_type,
                    role_name: sidebarData.scenarioInfo.role_name,
                    scenario_name: sidebarData.scenarioInfo.name,
                    agentID: sidebarData.scenarioInfo.agent_id,
                    trainID: sidebarData.modelInfo.id,
                    time: sidebarData.evaluateDataInfo.time,
                    version: sidebarData.modelInfo.version
                }
            };
            const response = await fetch(__APP_CONFIG__.startEvaluation, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(evalData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || '评估请求失败');
            }
            alert("数据发送成功，后台正在评估中•••");
            const result = await response.json();
            setChartOptions(result.chart_data);
            setCharts(Array(4).fill({ img: null }));
            setEvents(result.event_data.map((content) => ({ content })));
            setRadarImage(result.radar_chart_data);
            setEvalScore(result.eval_score);
            setEvalSuggestion(result.eval_suggestion);
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

    const handleGenerate = async (record, subModelId) => {
        setSelectedSubModel({ ...record, select_model: subModelId });
        setEpisodes(100);
        setIsEpisodesModalVisible(true);
    };

    const handleEpisodesConfirm = async () => {
        if (!selectedSubModel || episodes < 1) {
            alert('请输入有效的执行次数！');
            return;
        }
        try {
            const generateData = {
                model: {
                    id: selectedSubModel.model.id,
                    img_url: selectedSubModel.model.img_url,
                    select_model: selectedSubModel.select_model,
                    episodes: episodes,
                    model_path: selectedSubModel.model.model_path,
                    name: selectedSubModel.model.name,
                    nn_model_type: selectedSubModel.model.nn_model_type,
                    role_name: selectedSubModel.model.role_name,
                    scenario_name: selectedSubModel.model.scenario_name,
                    agentID: selectedSubModel.model.agentID,
                    time: selectedSubModel.model.time,
                    version: selectedSubModel.model.version
                }
            };
            const response = await fetch(__APP_CONFIG__.evaluateDataGenerate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(generateData),
            });
            if (!response.ok) {
                throw new Error('Failed to generate evaluation data');
            }
            const data = await response.json();
            if (data.status === 'success') {
                alert('数据生成成功！');
                setIsEpisodesModalVisible(false);
            } else {
                alert('数据生成失败！');
            }
        } catch (error) {
            console.error('Error generating evaluation data:', error);
            alert('数据生成失败！');
        }
    };

    const handleEffectModel = async (url) => {
        try {
            setEffectImageUrl(url);
            setIsEffectImageModalVisible(true);
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
        { title: '评估数据ID', dataIndex: 'id', key: 'id' },
        { title: '决策模型名称', dataIndex: 'name', key: 'name' },
        { title: '场景名称', dataIndex: 'scenario_name', key: 'scenario_name' },
        { title: '角色名称', dataIndex: 'role_name', key: 'role_name' },
        { title: '模型类型', dataIndex: 'nn_model_type', key: 'nn_model_type' },
        { title: '模型版本', dataIndex: 'version', key: 'version' },
        {
            title: '创建时间',
            dataIndex: 'time',
            key: 'time',
            render: (text) => formatDate(text),
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        className="EO-modal-button"
                        onClick={() => handleViewEvaluationData(record)}
                    >
                        查看
                    </Button>
                    <Button
                        className="EO-modal-button"
                        onClick={() => handleEffectModel(record.img_url)}
                    >
                        效果
                    </Button>
                </Space>
            ),
        },
    ];

    const subDataColumns = [
        { title: '模型子ID', dataIndex: 'subModelId', key: 'subModelId' },
        { title: '数据文件名', dataIndex: 'dataFile', key: 'dataFile' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button
                    className="EO-modal-button"
                    onClick={() => handleLoadEvaluationData(record.parentRecord, record.subModelId, record.dataFile)}
                >
                    载入
                </Button>
            ),
        },
    ];

    const modelListColumns = [
        { title: '模型ID', dataIndex: ['model', 'id'], key: 'modelId' },
        { title: '决策模型名称', dataIndex: ['model', 'name'], key: 'modelName' },
        { title: '场景名称', dataIndex: ['model', 'scenario_name'], key: 'scenarioName' },
        { title: '角色名称', dataIndex: ['model', 'role_name'], key: 'roleName' },
        { title: '模型类型', dataIndex: ['model', 'nn_model_type'], key: 'modelType' },
        { title: '模型版本', dataIndex: ['model', 'version'], key: 'modelVersion' },
        {
            title: '创建时间',
            dataIndex: ['model', 'time'],
            key: 'createTime',
            render: time => formatDate(time)
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
                        onClick={() => handleEffectModel(record.model.img_url)}
                    >
                        效果
                    </Button>
                </Space>
            ),
        },
    ];

    const subTableColumns = [
        {
            title: '模型子ID',
            dataIndex: 'subModelId',
            key: 'subModelId',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Button
                    className="EO-modal-button"
                    onClick={() => handleGenerate(record.parentRecord, record.subModelId)}
                >
                    生成
                </Button>
            ),
        },
    ];

    const envParamsColumns = [
        {
            title: '参数名称',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) => Object.keys(record)[0],
        },
        {
            title: '参数值',
            dataIndex: 'value',
            key: 'value',
            render: (_, record) => {
                const value = record[Object.keys(record)[0]];
                return typeof value === 'object' ? JSON.stringify(value) : value;
            },
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
                    <div className="EO-text">评估数据信息</div>
                    {sidebarData.evaluateDataInfo.id && (
                        <>
                            <div className="EO-info-item">评估数据ID: {sidebarData.evaluateDataInfo.id}</div>
                            <div className="EO-info-item">评估数据路径: {sidebarData.evaluateDataInfo.evaluateData_path}</div>
                            <div className="EO-info-item">模型子ID: {sidebarData.evaluateDataInfo.select_evaluateData}</div>
                            <div className="EO-info-item">数据文件名: {sidebarData.evaluateDataInfo.dataFile}</div>
                            <div className="EO-info-item">创建时间: {formatDate(sidebarData.evaluateDataInfo.time)}</div>
                        </>
                    )}
                </div>
                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">场景信息</div>
                    {sidebarData.scenarioInfo.name && (
                        <>
                            <div className="EO-info-item">名称: {sidebarData.scenarioInfo.name}</div>
                            <div className="EO-info-item">角色名称: {sidebarData.scenarioInfo.role_name}</div>
                            <div className="EO-info-item">智能体ID: {sidebarData.scenarioInfo.agent_id}</div>
                            <Table
                                columns={envParamsColumns}
                                dataSource={sidebarData.scenarioInfo.env_params}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </>
                    )}
                </div>
                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">模型信息</div>
                    {sidebarData.modelInfo.id && (
                        <>
                            <div className="EO-info-item">模型ID: {sidebarData.modelInfo.id}</div>
                            <div className="EO-info-item">模型名称: {sidebarData.modelInfo.name}</div>
                            <div className="EO-info-item">模型版本: {sidebarData.modelInfo.version}</div>
                            <div className="EO-info-item">模型类型: {sidebarData.modelInfo.nn_model_type}</div>
                            <div className="EO-info-item">创建时间: {formatDate(sidebarData.modelInfo.time)}</div>
                            <div className="EO-info-item">模型存放路径: {sidebarData.modelInfo.model_path}</div>
                            <div className="EO-info-item">模型效果图路径: {sidebarData.modelInfo.img_url}</div>
                        </>
                    )}
                </div>
                <div className="EO-sidebar-section EO-sidebar-scrollable">
                    <div className="EO-text">算法信息</div>
                    {sidebarData.algorithmInfo.id && (
                        <>
                            <div className="EO-info-item">算法ID: {sidebarData.algorithmInfo.id}</div>
                            <div className="EO-info-item">算法名称: {sidebarData.algorithmInfo.name}</div>
                            <div className="EO-info-item">算法类型: {sidebarData.algorithmInfo.type}</div>
                            <Table
                                columns={hyperParamsColumns}
                                dataSource={sidebarData.algorithmInfo.hyperParams}
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
                    rowKey={(record) => record.id}
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                columns={subDataColumns}
                                dataSource={record.evaluateData_list.map(([dataFile, subModelId]) => ({
                                    subModelId,
                                    dataFile,
                                    parentRecord: record
                                }))}
                                pagination={false}
                                rowKey="subModelId"
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <DownOutlined
                                onClick={(e) => onExpand(record, e)}
                                rotate={expanded ? 180 : 0}
                            />
                        )
                    }}
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
                            <div className="EO-text">模型信息</div>
                            <div className="EO-info-item">模型ID: {selectedModel.model_info.id}</div>
                            <div className="EO-info-item">模型名称: {selectedModel.model_info.name}</div>
                            <div className="EO-info-item">模型版本: {selectedModel.model_info.version}</div>
                            <div className="EO-info-item">模型类型: {selectedModel.model_info.nn_model_type}</div>
                            <div className="EO-info-item">创建时间: {formatDate(selectedModel.model_info.time)}</div>
                            <div className="EO-info-item">模型存放路径: {selectedModel.model_info.model_path}</div>
                            <div className="EO-info-item">模型效果图路径: {selectedModel.model_info.img_url}</div>
                        </div>
                        <div className="EO-detail-section">
                            <div className="EO-text">场景信息</div>
                            <div className="EO-info-item">场景名称: {selectedModel.scenario_info.name}</div>
                            <div className="EO-info-item">角色名称: {selectedModel.scenario_info.role_name}</div>
                            <div className="EO-info-item">智能体ID: {selectedModel.scenario_info.agent_id}</div>
                            <Table
                                columns={envParamsColumns}
                                dataSource={Object.entries(selectedModel.scenario_info.env_params).map(([key, value]) => ({ [key]: value }))}
                                pagination={false}
                                size="small"
                                rowKey={(record) => Object.keys(record)[0]}
                            />
                        </div>
                        <div className="EO-detail-section">
                            <div className="EO-text">算法信息</div>
                            <div className="EO-info-item">算法ID: {selectedModel.algorithm_info.id}</div>
                            <div className="EO-info-item">算法名称: {selectedModel.algorithm_info.name}</div>
                            <div className="EO-info-item">算法类型: {selectedModel.algorithm_info.type}</div>
                            <Table
                                columns={hyperParamsColumns}
                                dataSource={Object.entries(selectedModel.algorithm_info.hyper_params).map(([key, value]) => ({ [key]: value }))}
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
                    expandable={{
                        expandedRowRender: (record) => (
                            <Table
                                columns={subTableColumns}
                                dataSource={record.model.model_list.map(subModelId => ({
                                    subModelId,
                                    parentRecord: record
                                }))}
                                pagination={false}
                                rowKey="subModelId"
                            />
                        ),
                        expandIcon: ({ expanded, onExpand, record }) => (
                            <DownOutlined
                                onClick={(e) => onExpand(record, e)}
                                rotate={expanded ? 180 : 0}
                            />
                        )
                    }}
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
                        <p><strong>模型ID：</strong>{currentModel.model.id}</p>
                        <p><strong>决策模型名称：</strong>{currentModel.model.name}</p>
                        <p><strong>模型版本：</strong>{currentModel.model.version}</p>
                        <p><strong>模型类型：</strong>{currentModel.model.nn_model_type}</p>
                        <p><strong>场景名称：</strong>{currentModel.model.scenario_name}</p>
                        <p><strong>角色名称：</strong>{currentModel.model.role_name}</p>
                        <p><strong>智能体ID：</strong>{currentModel.model.agentID}</p>
                        <p><strong>创建时间：</strong>{formatDate(currentModel.model.time)}</p>
                        <p><strong>模型存放路径：</strong>{currentModel.model.model_path || '未提供'}</p>
                        <p><strong>模型效果图路径：</strong>{currentModel.model.img_url || '未提供'}</p>
                    </div>
                )}
            </Modal>
            <Modal
                title="训练效果图片"
                open={isEffectImageModalVisible}
                onCancel={() => setIsEffectImageModalVisible(false)}
                footer={null}
                zIndex={2000}
            >
                {effectImageUrl && <img src={effectImageUrl} alt="训练效果图片" style={{ width: '100%' }} />}
            </Modal>
            <Modal
                title="请输入执行次数"
                open={isEpisodesModalVisible}
                onOk={handleEpisodesConfirm}
                onCancel={() => setIsEpisodesModalVisible(false)}
                okText="确认"
                cancelText="取消"
            >
                <InputNumber
                    min={1}
                    value={episodes}
                    onChange={(value) => setEpisodes(value)}
                    style={{ width: '100%' }}
                />
            </Modal>
        </div>
    );
};

export default EvaluationOptimization;