import React from 'react';

const RighT = ({ selectedAlgorithm, selectedScenario ,selectedAgentRole}) => {
  return (
    <div className='right'>
      <h3>已选算法详情</h3>
      {selectedAlgorithm ? (
        <div>
          <p><strong>名称:</strong> {selectedAlgorithm.name}</p>
          <p><strong>类型:</strong> {selectedAlgorithm.type}</p>
          {/* 假设还有其他属性，例如 description, version 等 */}
          <p><strong>描述:</strong> {selectedAlgorithm.description || '无描述'}</p>
          <p><strong>版本:</strong> {selectedAlgorithm.version || '未知版本'}</p>
          {/* 可以根据需要添加更多字段 */}
        </div>
      ) : (
        <p>请选择一个算法</p>
      )}

      <hr />

      <h3>已选想定场景详情</h3>
      {selectedScenario ? (
        <div>
          <p><strong>名称:</strong> {selectedScenario.name}</p>
          <p><strong>ID:</strong> {selectedScenario.id || '未知ID'}</p>
          {/* 根据实际数据结构展示更多想定场景的信息 */}
          <p><strong>描述:</strong> {selectedScenario.description || '无描述'}</p>
          {/* 可以根据需要添加更多字段 */}
        </div>
      ) : (
        <p>请选择一个想定场景</p>
      )}

      <hr />


      
      <h3>已选智能体角色详情</h3>
      {selectedAgentRole ? (
        <div>
          <p><strong>ID:</strong> {selectedAgentRole.id || '未知ID'}</p>
          <p><strong>名称:</strong> {selectedAgentRole.name || '未知ID'}</p>
        </div>
      ) : (
        <p>请选择一个想定场景</p>
      )}
    
    </div>
    
  );
};

export default RighT;



// import React from 'react';
// import { Card, Select, Row, Col, Space } from 'antd';
// import { SettingOutlined } from '@ant-design/icons';
// const { Option } = Select;

// const Right = ({ selectedAlgorithm }) => {
//   // 调试输出，确保 selectedAlgorithm 和 hyperParameters 是按预期接收的
//   console.log('Selected Algorithm:', selectedAlgorithm);

//   if (!selectedAlgorithm || !selectedAlgorithm['hyper-parameters']) {
//     return <div>请选择一个算法</div>;
//   }

//   const hyperParameters = selectedAlgorithm['hyper-parameters'];

//   return (
//     <div>
//       <Card
//         title={
//           <div style={{ backgroundColor: '#f0f0f0', fontSize: '24px', textAlign: 'center' }}>
//             训练超参数
//             <SettingOutlined style={{ marginLeft: 8 }} />
//           </div>
//         }
//         bordered={true}
//         style={{ marginBottom: 16 }}
//       >
//         <Row gutter={[16, 16]}>
//           {hyperParameters.map((param, index) => {
//             // 确保 value 数组中的值是唯一的并排序
//             const uniqueValues = [...new Set(param.value)].sort((a, b) => a - b);

//             // 确保默认值存在于 value 数组中
//             const defaultValueExists = uniqueValues.includes(param.default);
//             const defaultValue = defaultValueExists ? param.default : uniqueValues[0]; // 如果默认值不存在，则选择第一个值

//             return (
//               <Col key={index} span={8}>
//                 <Space align="baseline" style={{ marginBottom: 8 }}>
//                   <span>{param.name}:</span>
//                   <Select defaultValue={defaultValue} style={{ width: '100%' }}>
//                     {uniqueValues.map((value, idx) => (
//                       <Option key={`${param.id}-${idx}`} value={value}>
//                         {value}
//                       </Option>
//                     ))}
//                   </Select>
//                 </Space>
//               </Col>
//             );
//           })}
//         </Row>
//       </Card>
//     </div>
//   );
// };

// export default Right;