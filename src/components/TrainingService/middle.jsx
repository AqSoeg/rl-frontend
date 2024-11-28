import React, { useState } from 'react';
import { Select, Button, Input, Card} from 'antd';

const { Option } = Select;

const Middle = () => {
    const [entity, setEntity] = useState('');
    const [attribute, setAttribute] = useState('');
    const [value, setValue] = useState('');
    const [entityInfo, setEntityInfo] = useState('');
  
    const handleEntityChange = (value) => {
      setEntity(value);
      // 模拟从后端获取实体信息
      const info = {
        'entity1': '智能体初始化信息: 实体1的详细信息...',
        'entity2': '智能体初始化信息: 实体2的详细信息...',
      };
      setEntityInfo(info[value]);
    };
  
    const handleAttributeChange = (value) => {
      setAttribute(value);
    };
  
    const handleValueChange = (value) => {
      setValue(value);
    };
  
    const handleUpdate = () => {
      // 这里可以添加发送请求到后端的逻辑
      console.log(`更新场景: 实体=${entity}, 属性=${attribute}, 值=${value}`);
      // 假设后端返回新的实体信息
      setEntityInfo(`更新后的实体信息: ${entity}的新详细信息...`);
    };
  return (
    <div>
        <div className="image-container">
            <Button className="first-button">图片区域</Button>
        </div>
        <div className='edit-container'>
            <Card title="场景编辑" bordered={false} >
                <span>实体：</span>
                <Select className="select-style" placeholder="选择实体" defaultValue={entity} onChange={handleEntityChange}>
                    <Option value="entity1">实体1</Option>
                    <Option value="entity2">实体2</Option>
                </Select>
                <Select className="select-style" placeholder="选择属性" defaultValue={attribute} onChange={handleAttributeChange}>
                    <Option value="position">位置</Option>
                    <Option value="color">颜色</Option>
                </Select>
                <Select className="select-style" placeholder="选择值" defaultValue={value} onChange={handleValueChange}>
                    <Option value="value1">值1</Option>
                    <Option value="value2">值2</Option>
                </Select>
                <Button type="primary" className="update-button" onClick={handleUpdate} >
                    更新
                </Button>
                <Input.TextArea className='input' rows={4} value={entityInfo} disabled />
            </Card>
        </div>
        <div className="form-item1">
            <Button className='third-button'>保存场景</Button>
        </div>
    </div>

  );
};

export default Middle;