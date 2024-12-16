import { Button } from 'antd';
import agentEditorStore from './AgentEditorStore';

const ModelFunction = () => {
    const handleSaveModel = () => {
        agentEditorStore.saveModel();
    };

    return (
        <div className="model-button-container">
            <Button className="model-button">载入模型</Button>
            <Button className="model-button" onClick={handleSaveModel}>保存模型</Button>
        </div>
    );
};

export default ModelFunction;