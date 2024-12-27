import React, { useState } from 'react';
import { Select, Button, Input, Card } from 'antd';
const { Option } = Select;

const Middle = ({ selectedScenario }) => {
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [entityInfo, setEntityInfo] = useState('');

  // 解析场景信息
  const parseScenario = (scenario) => {
    if (!scenario) return [];
    return scenario.roles.flatMap(role => role.entities);
  };

  const entities = parseScenario(selectedScenario);

  // 动态生成实体选项
  const entityOptions = entities.map(entity => (
    <Option key={entity.name} value={entity.name}>
      {entity.name}
    </Option>
  ));

  // 动态生成属性选项
  const attributeOptions = () => {
    const currentEntity = entities.find(ent => ent.name === entity);
    if (!currentEntity) return [];

    return currentEntity.stateVector.map(state => (
      <Option key={state[0]} value={state[0]}>
        {state[1]}
      </Option>
    ));
  };

  // 动态生成值选项
  const valueOptions = () => {
    const currentEntity = entities.find(ent => ent.name === entity);
    if (!currentEntity) return [];

    const currentAttribute = currentEntity.stateVector.find(state => state[0] === attribute);
    if (!currentAttribute) return [];

    let options = [];
    if (currentEntity.actionSpace && Object.keys(currentEntity.actionSpace).includes(attribute)) {
      options = currentEntity.actionSpace[attribute];
    }

    return options.map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  };

  const handleEntityChange = (value) => {
    setEntity(value);
    setAttribute(''); // 清空属性
    setValue(''); // 清空值
    const info = entities.find(ent => ent.name === value)?.name || '';
    setEntityInfo(info);
  };

  const handleAttributeChange = (value) => {
    setAttribute(value);
    setValue(''); // 当属性改变时清空值
  };

  const handleValueChange = (value) => {
    setValue(value);
  };

  const handleUpdate = () => {
    console.log(`更新场景: 实体=${entity}, 属性=${attribute}, 值=${value}`);
    setEntityInfo(`更新后的实体信息: ${entity}的新详细信息...`);
  };


  return (
    <div>
      <div className="image-container">
        <Button className="first-button">图片区域</Button>
      </div>
      <div className='edit-container'>
        <Card title="场景编辑" bordered={false}>
          <span>实体：</span>
          <Select
            className="select-style"
            placeholder="选择实体"
            value={entity}
            onChange={handleEntityChange}
            style={{ width: 'auto' }} // 自适应宽度
            dropdownMatchSelectWidth={false} // 下拉菜单不匹配选择框宽度
          >
            {entityOptions}
          </Select>
          <span>属性：</span>
          <Select
            className="select-style"
            placeholder="选择属性"
            value={attribute}
            onChange={handleAttributeChange}
            style={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
          >
            {attributeOptions()}
          </Select>
          <span>值：</span>
          <Select
            className="select-style"
            placeholder="选择值"
            value={value}
            onChange={handleValueChange}
            style={{ width: 'auto' }}
            dropdownMatchSelectWidth={false}
          >
            {valueOptions()}
          </Select>
          <Button type="primary" className="update-button" onClick={handleUpdate}>
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