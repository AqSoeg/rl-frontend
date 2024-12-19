import { Button } from 'antd';
import sidebarStore from './SidebarStore'; // 引入 SidebarStore
import entityAssignmentStore from './EntityAssignmentStore'; // 引入 entityAssignmentStore

const ModelFunction = () => {
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

    return (
        <div className="model-button-container">
            <Button className="model-button">载入模型</Button>
            <Button className="model-button" onClick={handleSaveModel}>保存模型</Button>
        </div>
    );
};

export default ModelFunction;