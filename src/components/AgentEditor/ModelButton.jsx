import { Button } from 'antd';
import './AgentEditor.css'; // 引入 CSS 文件

const ModelFunction = () => {
    return (
        <div className="model-button-container">
            <Button className="model-button">载入模型</Button>
            <Button className="model-button">保存模型</Button>
        </div>
    );
};

export default ModelFunction;