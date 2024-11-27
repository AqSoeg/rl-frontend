import { Button } from 'antd';
import './AgentEditor.css'; // 引入 CSS 文件

const ModelFunction = () => {
    return (
        <div className="button-container">
            <Button className="button">载入模型</Button>
            <Button className="button">保存模型</Button>
        </div>
    );
};

export default ModelFunction;