import { Button } from 'antd';

const ModelFunction = () => {
    return (
        <div className="mt-4 flex space-x-4">
            <Button className="w-full bg-green-500 text-white hover:bg-blue-600">载入模型</Button>
            <Button className="w-full bg-green-500 text-white hover:bg-green-600">保存模型</Button>
        </div>
    );
};

export default ModelFunction;