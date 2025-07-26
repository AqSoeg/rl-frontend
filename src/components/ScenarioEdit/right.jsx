import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col,  Button, Modal, Table, message, Input } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import DeploymentCanvas from '../TrainingService/DeploymentCanvas'; // Import the new canvas component

const { Option } = Select;

const Right = observer(() => {
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [envParamsMap, setEnvParamsMap] = useState({});
  const [entityParamsInfo, setEntityParamsInfo] = useState('');
  const [modifiedParams, setModifiedParams] = useState({});
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents1, setAgents1] = useState([]);
  const [isScenarioModalVisible, setIsScenarioModalVisible] = useState(false);
  const [deploymentData, setDeploymentData] = useState(null); 

  
  useEffect(() => {
    setEntity('');
    setAttribute('');
    setValue('');
    setEntityParamsInfo('');

    if (intelligentStore.selectedScenario && intelligentStore.selectedScenario.env_params) {
      const envParamsMap = intelligentStore.selectedScenario.env_params.reduce((acc, param) => {
        acc[param.name] = param.params.map(p => ({
          key: p[0],
          label: p[1],
          value: p[2],
          options: p[3]
        }));
        return acc;
      }, {});

      setEnvParamsMap(envParamsMap);
    }
  }, [intelligentStore.selectedScenario]);

  const handleEntityChange = (value) => {
    setEntity(value);
    setAttribute('');
    setValue('');

    if (intelligentStore.selectedScenario && intelligentStore.selectedScenario.env_params) {
      const selectedEntity = intelligentStore.selectedScenario.env_params.find(param => param.name === value);
      if (selectedEntity) {
        const paramsInfo = selectedEntity.params.map(param => {
          const [key, label, defaultValue, options] = param;
          return `${label}：${defaultValue}`;
        }).join('，');
        setEntityParamsInfo(paramsInfo);
      }
    }
  };

  const handleAttributeChange = (value) => {
    setAttribute(value);
    const attributeInfo = envParamsMap[entity].find(attr => attr.key === value);
    setValue(attributeInfo ? attributeInfo.value : '');
  };

  const handleValueChange = (value) => {
    setValue(value);
  };

  const handleUpdate = async () => {
    const selectedEntityParams = envParamsMap[entity];
    if (selectedEntityParams) {
      const selectedAttributeInfo = selectedEntityParams.find(attr => attr.key === attribute);
      if (selectedAttributeInfo) {
        try {
          const response = await fetch(__APP_CONFIG__.updateDbJson, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              scenarioId: intelligentStore.selectedScenario.id,
              entityName: entity,
              attributeKey: selectedAttributeInfo.key,
              newValue: value
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          setModifiedParams(prevState => ({
            ...prevState,
            [entity]: {
              ...prevState[entity],
              [selectedAttributeInfo.label]: value,
            },
          }));

          const displayText = selectedEntityParams
            .map(attr => `${attr.label}：${attr.key === attribute ? value : attr.value}`)
            .join(',');

          setEntityParamsInfo(displayText);
          message.success('更新成功');
        } catch (error) {
          message.error('更新失败');
          console.error('更新失败:', error);
        }
      } else {
        setEntityParamsInfo('请选择一个属性');
      }
    } else {
      setEntityParamsInfo('请选择一个实体');
    }
  };

  const entityOptions = Object.keys(envParamsMap).map(name => (
    <Option key={name} value={name}>
      {name}
    </Option>
  ));

  const attributeOptions = () => {
    return envParamsMap[entity] ? envParamsMap[entity].map(param => (
      <Option key={param.key} value={param.key}>
        {param.label}
      </Option>
    )) : [];
  };

  const valueOptions = () => {
    if (!intelligentStore.selectedScenario || !envParamsMap[entity]) return [];

    const currentParam = envParamsMap[entity].find(param => param.key === attribute);
    if (!currentParam) return [];

    return currentParam.options.map(option => (
      <Option key={option} value={option}>
        {option}
      </Option>
    ));
  };

  

  const handleView = (agent) => {
    setSelectedAgent(agent);
    setIsDetailModalVisible(true);
  };

  
    const fetchAgents = async () => {
      try {
        const requestBody = {
          scenarioID: intelligentStore.selectedScenario.id,
          
        };
  
        const response = await fetch(__APP_CONFIG__.getModels, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
  
        const data = await response.json();
        const models = data.models;
  
        
        const filteredAgents1 = models.filter(
          (agent) =>
            agent.scenarioID === intelligentStore.selectedScenario.id
        );
  
        setAgents1(filteredAgents1);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
  
    useEffect(() => {
      if (intelligentStore.selectedScenario ) {
        fetchAgents();
      }
    }, [intelligentStore.selectedScenario]);
  

  

  const scenarioViewColumns = [
    {
      title: '序号',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    { title: '想定场景', dataIndex: 'scenarioID', key: 'scenarioID' },
    { title: '智能体角色', dataIndex: 'agentRoleID', key: 'agentRoleID' },
    { title: '智能体ID', dataIndex: 'agentID', key: 'agentID' },
    { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
    { title: '版本', dataIndex: 'agentVersion', key: 'agentVersion' },
    { title: '智能体类型', dataIndex: 'agentType', key: 'agentType' },
    { 
      title: '更新时间', 
      dataIndex: 'updateTime', 
      key: 'updateTime', 
      render: time => new Date(time).toLocaleString() 
    },
    {
      title: '实体分配',
      dataIndex: 'entityAssignments',
      key: 'entityAssignments',
      render: (text, record) => {
        const assignments = record.entityAssignments.map((assignment, index) => {
          const agentName = Object.keys(assignment)[0];
          const entities = assignment[agentName].join(', ');
          return `${agentName}: ${entities}`;
        });

        return (
          <div>
            {assignments.map((assignment, index) => (
              <div key={index}>{assignment}</div>
            ))}
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Button type="primary" onClick={() => handleView(record)}>查看</Button>
      ),
    },
  ];

  const viewscenario = async () => {
    if (!intelligentStore.selectedScenario) {
      message.error("请先选择想定场景");
      return;
    }

    try {
      const response = await fetch(__APP_CONFIG__.get_deployment_image, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioId: intelligentStore.selectedScenario.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setDeploymentData(data.deployment_data); 
        setIsScenarioModalVisible(true);
      } else {
        message.error('获取部署图失败');
      }
    } catch (error) {
      console.error('获取部署图失败:', error);
      message.error('获取部署图失败，请检查网络或联系管理员');
    }
  };



  const renderAgentDetails = (agent) => {
    return agent.agentModel.map((model, modelIndex) => {
      const assignedEntities = agent.entityAssignments.find(assignment => 
        Object.keys(assignment)[0] === model.name)?.[model.name] || [];

      return (
        <div key={modelIndex} style={{ marginBottom: 24 }}>
          <h3 style={{ color: '#1890ff', fontSize: 18 }}>{model.name}</h3>
          
          <h4>实体状态信息</h4>
          {[...new Set(model.stateVector.map(state => state[0]))].map((entity) => {
            const stateInfo = model.stateVector
              .filter((state) => state[0] === entity)
              .map((state) => ({
                fieldName: state[2],
                fieldValue: state[3]
              }));

            return (
              <div key={entity} style={{ 
                marginBottom: 16,
                border: '1px solid #d9d9d9',
                borderRadius: 4,
                padding: 12
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: 16,
                  marginBottom: 8,
                  color: '#1890ff'
                }}>
                  {entity}
                </div>
                {stateInfo.map((state, index) => (
                  <div key={index} style={{ 
                    display: 'flex',
                    marginBottom: 4,
                    paddingLeft: 12
                  }}>
                    <div style={{ 
                      flex: '0 0 180px',
                      color: '#666'
                    }}>
                      {state.fieldName}
                    </div>
                    <div style={{ flex: 1 }}>
                      {state.fieldValue || '-'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          <h4>模型动作信息</h4>
          <Table
            columns={[
              { title: '实体名称', dataIndex: 'name', key: 'name' },
              { title: '动作名称', dataIndex: 'actionName', key: 'actionName' },
              { title: '动作类型', dataIndex: 'actionType', key: 'actionType' },
              { title: '动作值', dataIndex: 'actionValue', key: 'actionValue' },
              { title: '最大动作取值', dataIndex: 'maxActionValue', key: 'maxActionValue' },
              { title: '规则', dataIndex: 'rule', key: 'rule' },
            ]}
            dataSource={assignedEntities.map((entity) => {
              const action = model.actionSpace.find((action) => action.entity === entity);
              return {
                key: entity,
                name: entity,
                actionName: action ? action.name : '无',
                actionType: action ? action.type : '无',
                actionValue: action ? (
                  Array.isArray(action.action[0]) ? action.action[0].join(', ') : action.action[0]
                ) : '无',
                maxActionValue: action ? (
                  action.type === '离散型' ? 
                    (Array.isArray(action.action[1]) ? action.action[1].join(', ') : action.action[1]) :
                    (Array.isArray(action.action[2]) ? action.action[2].join('-') : action.action[2])
                ) : '无',
                rule: action ? (
                  action.rules.map(rule => rule.join(', ')).join('; ')
                ) : '无',
              };
            })}
            pagination={false}
            bordered
          />
        </div>
      );
    });
  };

  return (
    <div className='right1' style={{ height: '80vh', width:'95%',margin: '0 auto' }}>
      
      <div className='edit-container'>
        <Card 
          title={<div style={{ textAlign: 'center', backgroundColor: '#e6f7ff', padding: '8px 0' }}>场景编辑</div>} 
          bordered={false}
          style={{ marginBottom: 16 }}
        >
          <span>实体：</span>
          <Select
            className="select-style"
            placeholder="选择实体"
            value={entity}
            onChange={handleEntityChange}
            style={{ width: 'auto' }}
            popupMatchSelectWidth={false}
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
            popupMatchSelectWidth={false}
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
            popupMatchSelectWidth={false}
          >
            {valueOptions()}
          </Select>
          <Button type="primary" className="update-button" onClick={handleUpdate}>
            更新
          </Button>
          <Button type="primary" className="update-button" onClick={viewscenario}>
            场景查看
          </Button>
          <Input.TextArea className='input' rows={8} value={entityParamsInfo} disabled />
        </Card>
      </div>
    
      <Modal
        title="智能体详情"
        open={isDetailModalVisible}
        onOk={() => setIsDetailModalVisible(false)}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={1000}
        zIndex={1001}
      >
        {selectedAgent && (
          <div>
            <p><strong>智能体名称：</strong>{selectedAgent.agentName}</p>
            <p><strong>智能体ID：</strong>{selectedAgent.agentID}</p>
            <p><strong>版本：</strong>{selectedAgent.agentVersion}</p>
            <p><strong>智能体类型：</strong>{selectedAgent.agentType}</p>
            <p><strong>更新时间：</strong>{new Date(selectedAgent.updateTime).toLocaleString()}</p>
            <p><strong>想定场景：</strong>{selectedAgent.scenarioID}</p>

            <h3>智能体分配信息</h3>
            <Table
              columns={[
                { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
                { title: '分配实体', dataIndex: 'assignedEntities', key: 'assignedEntities' },
              ]}
              dataSource={selectedAgent.entityAssignments.flatMap((assignment) =>
                Object.entries(assignment).map(([agentName, entities]) => ({
                  key: agentName,
                  agentName: agentName,
                  assignedEntities: entities.join(', '),
                }))
              )}
              pagination={false}
              bordered
            />

            <h3>实体状态与动作信息</h3>
            {renderAgentDetails(selectedAgent)}

            <h3>奖励信息</h3>
            <Table
              columns={[
                { title: '奖励名称', dataIndex: 'rewardName', key: 'rewardName' },
                { title: '奖励值', dataIndex: 'rewardValue', key: 'rewardValue' },
              ]}
              dataSource={
                selectedAgent.agentModel
                  .flatMap(model => model.rewardFunction)
                  .reduce((acc, reward) => {
                    const existing = acc.find(item => item.rewardName === reward[1]);
                    if (existing) {
                      existing.rewardValue = `${existing.rewardValue}`;
                    } else {
                      acc.push({
                        key: reward[1],
                        rewardName: reward[1],
                        rewardValue: reward[0],
                      });
                    }
                    return acc;
                  }, [])
              }
              pagination={false}
              bordered
            />
          </div>
        )}
      </Modal>

      
      <Modal
        title="场景查看"
        open={isScenarioModalVisible}
        onOk={() => setIsScenarioModalVisible(false)}
        onCancel={() => setIsScenarioModalVisible(false)}
        width={1800} 
        footer={null}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card title="部署图" bordered={false} style={{ height: '100%' }}>
              {deploymentData ? (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '60vh',
                  backgroundColor: '#fff'
                }}>
                  <DeploymentCanvas 
                    deploymentData={deploymentData} 
                    width={800} 
                    height={600} 
                  />
                </div>
              ) : (
                <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }}>
                  加载部署图中...
                </div>
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              title="场景信息" 
              bordered={false}
              style={{ height: '100%' }}
              styles={{ body: { padding: 0 } }}
            >
              <div style={{ height: '60vh', overflowY: 'auto' }}>
                {agents1.length > 0 ? (
                  <Table
                    columns={scenarioViewColumns}
                    dataSource={agents1}
                    pagination={{ pageSize: 5 }}
                    bordered
                    rowKey="agentID"
                    scroll={{ y: 'calc(60vh - 55px)' }}
                  />
                ) : (
                  <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }}>
                    暂无智能体信息
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </Modal>

    </div>
  );
});

export default Right;