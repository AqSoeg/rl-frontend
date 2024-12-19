import { Button, Modal, Table } from 'antd';
import { useState, useEffect } from 'react';
import sidebarStore from './SidebarStore'; // 引入 SidebarStore
import entityAssignmentStore from './EntityAssignmentStore'; // 引入 entityAssignmentStore

const ModelFunction = ({ scenarios }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);

    // 获取 model.json 中的数据
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('WebSocket connected');
            // 请求模型数据
            ws.send(JSON.stringify({ type: 'getModels' }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'models') {
                setModels(data.models);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        // 组件卸载时关闭 WebSocket 连接
        return () => ws.close();
    }, []);

    // 处理模型选择
    const handleModelSelect = (model) => {
        setSelectedModel(model);
    };

    // 处理模型确认
    const handleModelConfirm = () => {
        if (!selectedModel) {
            alert('请选择一个智能体模型！');
            return;
        }

        // 确保 entityAssignments 存在且是一个非空数组
        if (!Array.isArray(selectedModel.entityAssignments) || selectedModel.entityAssignments.length === 0) {
            alert('选择的模型中没有实体分配信息！');
            return;
        }

        // 将 entityAssignments 从数组转换为对象格式
        const assignedEntities = selectedModel.entityAssignments.reduce((acc, assignment) => {
            const agent = Object.keys(assignment)[0]; // 获取智能体名称
            acc[agent] = assignment[agent]; // 将实体分配信息存入对象
            return acc;
        }, {});

        // 清空所有状态
        sidebarStore.clearExceptScenario();
        entityAssignmentStore.clearAssignment();

        // 更新侧边栏状态
        sidebarStore.setScenario(selectedModel.scenarioID); // 设置 scenarioID
        sidebarStore.setRole(selectedModel.agentRoleID);
        sidebarStore.setType(selectedModel.agentType);
        sidebarStore.setName(selectedModel.agentName);
        sidebarStore.setVersion(selectedModel.agentVersion);
        sidebarStore.setAgentCount(Object.keys(assignedEntities).length.toString()); // 设置智能体数量
        sidebarStore.setModelID(selectedModel.agentID);

        // 更新实体分配状态
        entityAssignmentStore.setAssignedEntities(assignedEntities);

        // 关闭模态窗口
        setIsModalVisible(false);
    };

    // 处理模型取消
    const handleModelCancel = () => {
        setIsModalVisible(false);
    };

    // 处理保存模型
    const handleSaveModel = () => {
        if (!sidebarStore.canSaveModel()) {
            alert('请先选择智能体模型后再保存模型！');
            return;
        }

        const confirmSave = window.confirm('是否确认保存模型？');
        if (confirmSave) {
            // 保存模型的逻辑
            const modelData = {
                scenarioID: sidebarStore.scenario,
                agentRoleID: sidebarStore.role,
                agentType: sidebarStore.type,
                agentName: sidebarStore.name,
                agentVersion: sidebarStore.version,
                agentID: sidebarStore.modelID,
                agentModelName: sidebarStore.selectedAgent,
                entityAssignments: Object.entries(entityAssignmentStore.assignedEntities).map(([agent, entities]) => ({
                    [agent]: entities
                })),
                updateTime: new Date().toISOString()
            };

            // 发送数据到 WebSocket 服务器
            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                ws.send(JSON.stringify(modelData));
                ws.close();
            };

            ws.onmessage = (event) => {
                const response = JSON.parse(event.data);
                if (response.status === 'success') {
                    alert('模型保存成功！');
                } else {
                    alert('模型保存失败，请重试！');
                }
            };
        }
    };

    // 处理载入模型
    const handleLoadModel = () => {
        setIsModalVisible(true);
    };

    // 获取场景和角色的名称
    const getScenarioName = (scenarioID) => {
        const scenario = scenarios.find(s => s.id === scenarioID);
        return scenario ? scenario.name : '未知场景';
    };

    const getRoleName = (scenarioID, roleID) => {
        // 根据 scenarioID 找到对应的场景
        const scenario = scenarios.find(s => s.id === scenarioID);
        if (!scenario) {
            return '未知角色';
        }

        // 根据 roleID 找到对应的角色
        const role = scenario.roles.find(r => r.id === roleID);
        return role ? role.name : '未知角色';
    };

    // 表格列配置
    const columns = [
        { title: '序号', dataIndex: 'index', key: 'index' },
        { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
        { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
        { title: '场景', dataIndex: 'scenarioName', key: 'scenarioName' },
        { title: '智能体角色', dataIndex: 'roleName', key: 'roleName' },
        { title: '分配的实体名称', dataIndex: 'assignedEntities', key: 'assignedEntities' },
    ];

    // 表格数据
    const tableData = models.map((model, index) => {
        // 将 entityAssignments 从数组转换为对象格式
        const assignedEntities = model.entityAssignments.reduce((acc, assignment) => {
            const agent = Object.keys(assignment)[0]; // 获取智能体名称
            acc[agent] = assignment[agent]; // 将实体分配信息存入对象
            return acc;
        }, {});

        return {
            key: model.agentID,
            index: index + 1,
            agentID: model.agentID,
            agentName: `${model.agentName} v${model.agentVersion} ${model.agentModelName}`,
            scenarioName: getScenarioName(model.scenarioID),
            roleName: getRoleName(model.scenarioID, model.agentRoleID), // 传入 scenarioID 和 agentRoleID
            assignedEntities: Object.values(assignedEntities).flat().join(', '), // 将所有实体名称拼接成字符串
        };
    });

    return (
        <div className="model-button-container">
            <Button className="model-button" onClick={handleLoadModel}>载入模型</Button>
            <Button className="model-button" onClick={handleSaveModel}>保存模型</Button>

            <Modal
                title="请选择载入的智能体模型"
                open={isModalVisible} // 使用 open 替代 visible
                onOk={handleModelConfirm}
                onCancel={handleModelCancel}
                okText="确认"
                cancelText="取消"
            >
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowSelection={{
                        type: 'radio',
                        onChange: (selectedRowKeys, selectedRows) => {
                            handleModelSelect(selectedRows[0]);
                        },
                    }}
                    pagination={false}
                />
            </Modal>
        </div>
    );
};

export default ModelFunction;