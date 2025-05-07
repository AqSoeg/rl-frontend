import React, { useState, useEffect } from 'react';
import { Card, Select, Row, Col, Space, Button, Modal, Table, message, Input } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
const { Option } = Select;
const AgentTrainingPanel = observer(({ decisionModels, fetchDecisions, refreshData }) => {
  const [entity, setEntity] = useState('');
  const [attribute, setAttribute] = useState('');
  const [value, setValue] = useState('');
  const [envParamsMap, setEnvParamsMap] = useState({});
  const [entityParamsInfo, setEntityParamsInfo] = useState('');
  const [modifiedParams, setModifiedParams] = useState({});

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([]);
  const [agents1, setAgents1] = useState([]);
  const [isModelListModalVisible, setIsModelListModalVisible] = useState(false);
  const [isModelInfoModalVisible, setIsModelInfoModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [training, setTraining] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [hyperParametersValues, setHyperParametersValues] = useState({});
  const [effectImageUrl, setEffectImageUrl] = useState(null);
  const [isEffectImageModalVisible, setIsEffectImageModalVisible] = useState(false);

  const [isScenarioModalVisible, setIsScenarioModalVisible] = useState(false);
  const [deploymentImageUrl, setDeploymentImageUrl] = useState(null);
  const [processData, setProcessData] = useState(null);
  const [animationUrl, setAnimationUrl] = useState(null);
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  
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
          return `${label}：${defaultValue}（默认值）`;
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

          setEntityParamsInfo(`更新成功：${entity} 的 ${selectedAttributeInfo.label} 已修改为 ${value}`);
          message.success('更新成功', 5, () => {
            // 刷新页面
            refreshData();
          });
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
   // 获取智能体列表
    const fetchAgents = async () => {
      try {
        const requestBody = {
          scenarioID: intelligentStore.selectedScenario.id,
          agentRoleID: intelligentStore.selectedAgentRole.id,
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
  
        const filteredAgents = models.filter(
          (agent) =>
            agent.scenarioID === intelligentStore.selectedScenario.id &&
            agent.agentRoleID === intelligentStore.selectedAgentRole.id
        );
  
        setAgents(filteredAgents);
        const filteredAgents1 = models.filter(
            (agent) =>
              agent.scenarioID === intelligentStore.selectedScenario.id
          );
    
          setAgents1(filteredAgents1);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
  
    // 当场景或智能体角色发生变化时，重新获取智能体列表
    useEffect(() => {
      if (intelligentStore.selectedScenario && intelligentStore.selectedAgentRole) {
        fetchAgents();
      }
    }, [intelligentStore.selectedScenario, intelligentStore.selectedAgentRole]);
  
    // 初始化超参数值
    useEffect(() => {
      if (intelligentStore.selectedAlgorithm && intelligentStore.selectedAlgorithm['hyper-parameters']) {
        const initialParams = intelligentStore.selectedAlgorithm['hyper-parameters'].reduce((acc, param) => {
          acc[param.id] = param.default;
          return acc;
        }, {});
        setHyperParametersValues(initialParams);
      }
    }, [intelligentStore.selectedAlgorithm]);
  
    useEffect(() => {
      setSelectedAgent(null); // 清除之前载入的智能体信息
      setTraining(false); // 重置训练状态
      intelligentStore.loadAgent(null); // 清除 IntelligentStore 中的智能体信息
    }, [intelligentStore.selectedAlgorithm,intelligentStore.selectedAgentRole]);
  
  
  
    const isModelCompatibleWithAlgorithm = (model, algorithm) => {
      if (model.agentType === "单智能体" && algorithm.type_name !== "单智能体") {
        return false;
      }
  
      if (model.agentType === "异构多智能体" && algorithm.type_name !== "分布式多智能体") {
        return false;
      }
  
      if (model.agentType === "同构多智能体" && !["分布式多智能体", "共享多智能体"].includes(algorithm.type_name)) {
        return false;
      }
  
      return true;
    };
  
    const trainAlgorithm = async () => {
      const selectedAgent = intelligentStore.selectedAgent;
      const selectedAlgorithm = intelligentStore.selectedAlgorithm;
  
      if (!selectedAgent) {
        message.error("请先载入智能体！");
        return;
      }
  
      if (!selectedAlgorithm) {
        message.error("请先选择算法！");
        return;
      }
  
      if (!isModelCompatibleWithAlgorithm(selectedAgent, selectedAlgorithm)) {
        message.error("模型与算法类型不匹配，无法训练！");
        return;
      }
  
      setTraining(true); // 开始训练时设置训练状态为 true
      try {
        const requestBody = {
          agentInfo: {
            agentID: selectedAgent.agentID,
            agentName: selectedAgent.agentName,
            agentType: selectedAgent.agentType,
            scenarioID: selectedAgent.scenarioID,
            agentRoleID: selectedAgent.agentRoleID,
          },
          algorithmInfo: {
            algorithmType: selectedAlgorithm.type,
            algorithmName: selectedAlgorithm.name,
            hyperParameters: hyperParametersValues,
          },
          scenarioEditInfo: {
            scenarioName: intelligentStore.selectedScenario.name,
            entities: intelligentStore.selectedAgentRole.id
          },
        };
  
        const response = await fetch(__APP_CONFIG__.train, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.status === 'success') {
          message.success('训练已开始！');
          const checkTrainingStatus = async () => {
            const statusResponse = await fetch(__APP_CONFIG__.training_status);
            const statusData = await statusResponse.json();
            if (statusData.status === "completed") {
              setTraining(false); // 训练完成时设置训练状态为 false
              if (statusData.result.status === "success") {
                message.success('训练完成，模型已保存！');
                fetchDecisions();
              } else if (statusData.result.status === "stopped") {
                message.warning('训练已终止，模型未保存');
              } else {
                message.error('训练失败，请检查日志');
              }
            } else {
              setTimeout(checkTrainingStatus, 1000);
            }
          };
          checkTrainingStatus();
        } else {
          setTraining(false); // 训练失败时设置训练状态为 false
          message.error('训练失败，请检查日志');
        }
      } catch (error) {
        setTraining(false); // 训练失败时设置训练状态为 false
        console.error('训练过程中发生错误:', error);
        message.error('训练失败，请检查日志');
      }
    };
  
    const stopTraining = async () => {
      try {
        const response = await fetch(__APP_CONFIG__.stop_training, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.status === 'success') {
          setTraining(false); // 终止训练时设置训练状态为 false
          message.success('训练终止请求已发送');
        } else {
          message.error('训练终止失败，请检查日志');
        }
      } catch (error) {
        console.error('训练终止失败:', error);
        message.error('训练终止失败，请检查网络或联系管理员');
      }
    };
  
    const handleView = (agent) => {
      setSelectedAgent(agent);
      setIsDetailModalVisible(true);
    };
  
    const handleLoad = (agent) => {
      const selectedAlgorithm = intelligentStore.selectedAlgorithm;
      if (!selectedAlgorithm) {
        message.error("请先选择算法！");
        return;
      }
  
      if (!isModelCompatibleWithAlgorithm(agent, selectedAlgorithm)) {
        message.error("模型与算法类型不匹配，无法载入！");
        return;
      }
  
      intelligentStore.loadAgent(agent);
      message.success("智能体载入成功！");
    };
  
    const handleViewModelListClick = () => {
      setIsModelListModalVisible(true);
    };
  
    const handleViewModel = (model) => {
      setCurrentModel(model);
      setIsModelInfoModalVisible(true);
    };
  
    const handleEffectModel = async (record) => {
      try {
        const response = await fetch(__APP_CONFIG__.get_effect, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decisionModelID: record.AGENT_MODEL_ID }),
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.status === 'success') {
          setEffectImageUrl(data.img_url);
          setIsEffectImageModalVisible(true);
        } else {
          message.error('获取效果图片失败，请检查日志');
        }
      } catch (error) {
        console.error('获取效果图片失败:', error);
        message.error('获取效果图片失败，请检查网络或联系管理员');
      }
    };
    const handlePublish = async (record) => {
      try {
        const response = await fetch(__APP_CONFIG__.publish_model, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decisionModelID: record.AGENT_MODEL_ID }),
        });
  
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
  
        const data = await response.json();
        if (data.status === 'success') {
          message.success("模型发布成功")
          fetchDecisions();
        } else {
          message.error('发布模型失败，请检查日志');
        }
      } catch (error) {
        console.error('发布模型失败:', error);
        message.error('发布模型失败，请检查网络或联系管理员');
      }
    };
    const scenarioColumns = [
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
      { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime', render: time => new Date(time).toLocaleString() },
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
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" onClick={() => handleView(record)}>查看</Button>
            <Button type="primary" onClick={() => handleLoad(record)}>载入</Button>
          </div>
        ),
      },
    ];
  
    const modelListColumns = [
      { title: '决策模型ID', dataIndex: 'AGENT_MODEL_ID', key: 'AGENT_MODEL_ID' },
      { title: '智能体名称', dataIndex: 'AGENT_NAME', key: 'AGENT_NAME' },
      { title: '场景名称', dataIndex: 'SCENARIO_NAME', key: 'SCENARIO_NAME' },
      { title: '角色名称', dataIndex: 'ROLE_NAME', key: 'ROLE_NAME' },
      { title: '模型版本', dataIndex: 'AGENT_MODEL_VERSION', key: 'AGENT_MODEL_VERSION' },
      { title: '模型类型', dataIndex: 'NN_MODEL_TYPE', key: 'NN_MODEL_TYPE' },
      { title: '创建时间', dataIndex: 'CREAT_TIME', key: 'CREAT_TIME', render: time => new Date(time).toLocaleString() },
      { title: '发布状态', dataIndex: 'STATE', key: 'STATE' },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" onClick={() => handleViewModel(record)}>查看</Button>
            <Button type="primary" onClick={() => handleEffectModel(record)}>效果</Button>
            <Button type="primary" onClick={() => handlePublish(record)}>发布</Button>
          </div>
        ),
      },
    ];
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
            // Fetch deployment image from backend
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
            setDeploymentImageUrl(data.img_url);
            setIsScenarioModalVisible(true);
            } else {
            message.error('获取部署图失败');
            }
        } catch (error) {
            console.error('获取部署图失败:', error);
            message.error('获取部署图失败，请检查网络或联系管理员');
        }
    };

    const handleprocess = async () => {
        if (!intelligentStore.selectedAgent) {
          message.error("请先载入智能体");
          return;
        }
      
        try {
          setIsProcessModalVisible(true);
          setAnimationUrl(null); // 重置动画URL
          
          const selectedAgent = intelligentStore.selectedAgent;
          
          const response = await fetch(__APP_CONFIG__.get_process_data, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agentId: selectedAgent.agentID,
              scenarioId: intelligentStore.selectedScenario.id
            }),
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const data = await response.json();
          if (data.status === 'success') {
            setAnimationUrl(data.animationUrl);
          } else {
            setAnimationUrl(null); // 确保设置为null以显示加载提示
          }
          
        } catch (error) {
          console.error('获取过程数据失败:', error);
          setAnimationUrl(null); // 确保设置为null以显示加载提示
          message.error('获取过程数据失败');
        }
      };
  // ================== 渲染部分 ==================
  return (
    <div className='right1' style={{ height: '80vh', width:'95%',margin: '0 auto' }}>
      <Card 
        title={<div style={{ textAlign: 'center', backgroundColor: '#e6f7ff', padding: '8px 0' }}>智能体载入</div>} 
        bordered={true}
        style={{ marginBottom: 16 }}
      >
        {intelligentStore.selectedScenario && intelligentStore.selectedAgentRole ? (
          <Table
            columns={scenarioColumns}
            dataSource={agents}
            pagination={{ pageSize: 4, showQuickJumper: true }}
            bordered
            rowKey="agentID"
          />
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }}>
            {!intelligentStore.selectedScenario && !intelligentStore.selectedAgentRole 
              ? '请先选择想定场景和智能体角色' 
              : !intelligentStore.selectedScenario 
                ? '请先选择想定场景' 
                : '请先选择智能体角色'}
          </div>
        )}
      </Card>
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
            <Input.TextArea className='input' rows={4} value={entityParamsInfo} disabled />
        </Card>
      </div>
      <Card 
        title={<div style={{ textAlign: 'center', backgroundColor: '#e6f7ff', padding: '8px 0' }}>训练超参数</div>} 
        bordered={true}
        style={{ marginBottom: 16 }}
      >
        {intelligentStore.selectedAlgorithm && intelligentStore.selectedAlgorithm['hyper-parameters'] ? (
          <Row >
            {intelligentStore.selectedAlgorithm['hyper-parameters'].map((param, index) => {
              const uniqueValues = [...new Set(param.value)].sort((a, b) => a - b);
              const defaultValueExists = uniqueValues.includes(param.default);
              const defaultValue = defaultValueExists ? param.default : uniqueValues[0];

              return (
                <Col key={index} span={8}>
                  <Space align="baseline" style={{ marginBottom: 8 }}>
                    <span>{param.name}:</span>
                    <Select
                      defaultValue={defaultValue}
                      onChange={(value) => {
                        setHyperParametersValues(prevState => ({
                          ...prevState,
                          [param.id]: value
                        }));
                      }}
                      style={{ width: '100%' }}
                    >
                      {uniqueValues.map((value, idx) => (
                        <Option key={`${param.id}-${idx}`} value={value}>
                          {value}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
              );
            })}
          </Row>
        ) : (
          <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }}>
            请先选择算法以显示超参数
          </div>
        )}
      </Card>

      <div className="button-container" style={{ 
        display: 'flex', 
        gap: '16px', // 设置按钮之间的间隙为16px
        justifyContent: 'center', // 水平居中
        marginTop: '16px' // 与上方内容的间距
      }}>
        <Button onClick={trainAlgorithm} disabled={training}>
          {training ? '训练中...' : '开始训练'}
        </Button>
        <Button onClick={handleViewModelListClick}>查看模型列表</Button>
        <Button onClick={handleprocess}>过程展示</Button>
        <Button onClick={stopTraining} disabled={!training}>
          终止训练
        </Button>
      </div>

      {/* 智能体详情弹窗 */}
      <Modal
        title="智能体详情"
        open={isDetailModalVisible}
        onOk={() => setIsDetailModalVisible(false)}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={800}
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

            <h3>实体状态信息</h3>
            <Table
              columns={[
                { title: '实体名称', dataIndex: 'name', key: 'name' },
                // 使用reduce来去除重复的列名
                ...selectedAgent.agentModel.flatMap((model) => {
                  return model.stateVector.map((state) => state[2]);
                }).reduce((uniqueColumns, field) => {
                  if (!uniqueColumns.includes(field)) {
                    uniqueColumns.push(field);
                  }
                  return uniqueColumns;
                }, []).map((field) => ({
                  title: field,
                  dataIndex: field,
                  key: field,
                }))
              ]}
              dataSource={selectedAgent.agentModel.flatMap((model) => {
                // 获取所有实体名称
                const entities = [...new Set(model.stateVector.map((state) => state[0]))];

                // 遍历每个实体，获取其对应的状态信息
                return entities.map((entity) => {
                  // 初始化状态信息
                  const entityState = {
                    key: entity,
                    name: entity,
                  };

                  // 遍历状态向量，更新状态信息，使用 state[2] 作为字段名
                  model.stateVector.forEach((state) => {
                    const [entityName, , fieldName, fieldValue] = state;
                    if (entityName === entity) {
                      entityState[fieldName] = fieldValue;
                    }
                  });

                  return entityState;
                });
              })}
              pagination={false}
              bordered
            />

            <h3>模型动作信息</h3>
            <Table
              columns={[
                { title: '实体名称', dataIndex: 'name', key: 'name' },
                { title: '动作名称', dataIndex: 'actionName', key: 'actionName' },
                { title: '动作类型', dataIndex: 'actionType', key: 'actionType' },
                { title: '动作值', dataIndex: 'actionValue', key: 'actionValue' },
                { title: '最大动作取值', dataIndex: 'maxActionValue', key: 'maxActionValue' },
                { title: '规则', dataIndex: 'rule', key: 'rule' },
              ]}
              dataSource={selectedAgent.agentModel.flatMap((model) => {
                const entities = [...new Set(model.stateVector.map((state) => state[0]))];
                return entities.map((entity) => {
                  const action = model.actionSpace.find((action) => action.entity === entity);
                  return {
                    key: entity,
                    name: entity,
                    actionName: action ? action.name : '无',
                    actionType: action ? action.type : '无',
                    actionValue: action ? (Array.isArray(action.action[0]) ? action.action[0].join(', ') : '无') : '无',
                    maxActionValue: action ? (
                      action.type === '离散型' ? 
                        (Array.isArray(action.action[1]) ? action.action[1].join(', ') : '无') :
                        (Array.isArray(action.action[2]) ? action.action[2].join('-') : '无')
                    ) : '无',
                    rule: action ? (Array.isArray(action.rule) ? action.rule.join(', ') : '无') : '无',
                  };
                });
              })}
              pagination={false}
              bordered
            />

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
                      // 如果奖励名称已存在，合并显示（这里保持原值，你也可以选择相加或其他处理）
                      existing.rewardValue = `${existing.rewardValue}`;
                    } else {
                      acc.push({
                        key: reward[1], // 使用奖励名称作为key
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

      {/* 模型列表弹窗 */}
      <Modal
        title="模型列表"
        open={isModelListModalVisible}
        onOk={() => setIsModelListModalVisible(false)}
        onCancel={() => setIsModelListModalVisible(false)}
        width={1000}
      >
        <Table
          columns={modelListColumns}
          dataSource={decisionModels}
          pagination={false}
          style={{ width: '100%' }}
          rowKey={'AGENT_MODEL_ID'}
        />
      </Modal>

      {/* 模型详情弹窗 */}
      <Modal
        title="模型详细信息"
        open={isModelInfoModalVisible}
        onOk={() => setIsModelInfoModalVisible(false)}
        onCancel={() => setIsModelInfoModalVisible(false)}
      >
        {currentModel && (
          <div>
            <p><strong>决策模型ID：</strong>{currentModel.AGENT_MODEL_ID}</p>
            <p><strong>智能体名称：</strong>{currentModel.AGENT_NAME}</p>
            <p><strong>场景名称：</strong>{currentModel.SCENARIO_NAME}</p>
            <p><strong>角色名称：</strong>{currentModel.ROLE_NAME}</p>
            <p><strong>模型版本：</strong>{currentModel.AGENT_MODEL_VERSION}</p>
            <p><strong>模型类型：</strong>{currentModel.NN_MODEL_TYPE}</p>
            <p><strong>创建时间：</strong>{currentModel.CREAT_TIME}</p>
            <p><strong>模型存放路径：</strong>{currentModel.MODEL_PATH}</p>
            <p><strong>模型效果图路径：</strong>{currentModel.IMG_URL}</p>
          </div>
        )}
      </Modal>

      {/* 训练状态弹窗 */}
      <Modal
        title="训练状态"
        open={isSuccessModalVisible}
        onOk={() => setIsSuccessModalVisible(false)}
        onCancel={() => setIsSuccessModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsSuccessModalVisible(false)}>
            确定
          </Button>,
        ]}
      >
        <p>训练完成！</p>
      </Modal>

      {/* 训练效果图片弹窗 */}
      <Modal
        title="训练效果图片"
        open={isEffectImageModalVisible}
        onOk={() => setIsEffectImageModalVisible(false)}
        onCancel={() => setIsEffectImageModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setIsEffectImageModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {effectImageUrl && <img src={effectImageUrl} alt="训练效果图片" style={{ width: '100%' }} />}
      </Modal>
      <Modal
        title="场景查看"
        open={isScenarioModalVisible}
        onOk={() => setIsScenarioModalVisible(false)}
        onCancel={() => setIsScenarioModalVisible(false)}
        width={1800} 
        footer={null}
        >
        <Row gutter={10}>
            <Col span={8}>
            <Card title="部署图" bordered={false}>
                {deploymentImageUrl ? (
                <img 
                    src={deploymentImageUrl} 
                    alt="部署图" 
                    style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain' }}
                />
                ) : (
                <div style={{ padding: 16, textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)' }}>
                    加载部署图中...
                </div>
                )}
            </Card>
            </Col>
            <Col span={16}>
            <Card 
                title="场景信息" 
                bordered={false}
                style={{ height: '100%' }}
                styles={{ body: { padding: 0 } }}
            >
                <div style={{ height: '60vh', overflowY: 'auto' }}>
                {agents.length > 0 ? (
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
        <Modal
            title="过程展示"
            open={isProcessModalVisible}
            onOk={() => setIsProcessModalVisible(false)}
            onCancel={() => setIsProcessModalVisible(false)}
            width={1800}
            footer={null}
            >
            <div style={{ display: 'flex', height: '600px' }}>
                {/* 数据展示部分 - 复用智能体详情弹窗的内容 */}
                <div style={{ 
                flex: 1, 
                borderRight: '1px solid #f0f0f0',
                padding: '16px',
                overflowY: 'auto'
                }}>
                {intelligentStore.selectedAgent ? (
                    <div>
                    <h3>智能体详细信息</h3>
                    <p><strong>智能体名称：</strong>{intelligentStore.selectedAgent.agentName}</p>
                    <p><strong>智能体ID：</strong>{intelligentStore.selectedAgent.agentID}</p>
                    <p><strong>版本：</strong>{intelligentStore.selectedAgent.agentVersion}</p>
                    <p><strong>智能体类型：</strong>{intelligentStore.selectedAgent.agentType}</p>
                    <p><strong>更新时间：</strong>{new Date(intelligentStore.selectedAgent.updateTime).toLocaleString()}</p>
                    <p><strong>想定场景：</strong>{intelligentStore.selectedAgent.scenarioID}</p>

                    <h3>智能体分配信息</h3>
                    <Table
                        columns={[
                        { title: '智能体名称', dataIndex: 'agentName', key: 'agentName' },
                        { title: '分配实体', dataIndex: 'assignedEntities', key: 'assignedEntities' },
                        ]}
                        dataSource={intelligentStore.selectedAgent.entityAssignments.flatMap((assignment) =>
                        Object.entries(assignment).map(([agentName, entities]) => ({
                            key: agentName,
                            agentName: agentName,
                            assignedEntities: entities.join(', '),
                        }))
                        )}
                        pagination={false}
                        bordered
                    />

                    <h3>实体状态信息</h3>
                    <Table
                        columns={[
                        { title: '实体名称', dataIndex: 'name', key: 'name' },
                        ...intelligentStore.selectedAgent.agentModel.flatMap((model) => {
                            return model.stateVector.map((state) => state[2]);
                        }).reduce((uniqueColumns, field) => {
                            if (!uniqueColumns.includes(field)) {
                            uniqueColumns.push(field);
                            }
                            return uniqueColumns;
                        }, []).map((field) => ({
                            title: field,
                            dataIndex: field,
                            key: field,
                        }))
                        ]}
                        dataSource={intelligentStore.selectedAgent.agentModel.flatMap((model) => {
                        const entities = [...new Set(model.stateVector.map((state) => state[0]))];
                        return entities.map((entity) => {
                            const entityState = {
                            key: entity,
                            name: entity,
                            };
                            model.stateVector.forEach((state) => {
                            const [entityName, , fieldName, fieldValue] = state;
                            if (entityName === entity) {
                                entityState[fieldName] = fieldValue;
                            }
                            });
                            return entityState;
                        });
                        })}
                        pagination={false}
                        bordered
                    />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>没有可用的智能体信息</p>
                    </div>
                )}
                </div>
                
                {/* 动画展示部分 */}
                <div style={{ 
                flex: 1, 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f5'
                }}>
                {animationUrl ? (
                    <>
                    <h3>训练过程动画</h3>
                    <div style={{ width: '100%', height: '100%' }}>
                        <img 
                        src={animationUrl} 
                        alt="训练过程动画" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                            e.target.onerror = null; // 防止无限循环
                            setAnimationUrl(null); // 图片加载失败时设置为null
                        }}
                        />
                    </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                    <h3>Sorry</h3>
                    <p>没有载入智能体的动画显示</p>
                    </div>
                )}
                </div>
            </div>
            </Modal>
    </div>
  );
});

export default AgentTrainingPanel;