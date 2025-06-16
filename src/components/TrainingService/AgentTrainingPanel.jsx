import React, { useState, useEffect,useRef } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Card, Select, Row, Col, Space, Button, Modal, Table, message, Input } from 'antd';
import { intelligentStore } from './IntelligentStore';
import { observer } from 'mobx-react';
import DeploymentCanvas from './DeploymentCanvas'; // Import the new canvas component
import ProcessAnimation from './ProcessAnimation';
const { Option } = Select;

const AgentTrainingPanel = observer(() => {
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
  const [deploymentData, setDeploymentData] = useState(null); // Changed from deploymentImageUrl
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [loadedModel, setLoadedModel] = useState(null);
  const [subModelPublishStatus, setSubModelPublishStatus] = useState({});
  const [modelListData, setModelListData] = useState([]);
  const [loadingModelList, setLoadingModelList] = useState(false);
  
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

  useEffect(() => {
    if (intelligentStore.selectedScenario && intelligentStore.selectedAgentRole) {
      fetchAgents();
    }
  }, [intelligentStore.selectedScenario, intelligentStore.selectedAgentRole]);

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
    setSelectedAgent(null);
    setTraining(false);
    intelligentStore.loadAgent(null);
  }, [intelligentStore.selectedAlgorithm, intelligentStore.selectedAgentRole]);

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

    if (intelligentStore.trainingMode === 'offline' && !intelligentStore.selectedDataset) {
      message.error("离线训练模式必须先载入一个数据集！");
      return;
    }

    setTraining(true);
    try {
      const requestBody = {
        agentInfo: {
          agentID: selectedAgent.agentID,
          agentName: selectedAgent.agentName,
          agentType: selectedAgent.agentType,
          agentVersion: selectedAgent.agentVersion,
          scenarioID: selectedAgent.scenarioID,
          agentRoleID: selectedAgent.agentRoleID,
          reward: selectedAgent.agentModel
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
        },
        algorithmInfo: {
          algorithmID: selectedAlgorithm.algorithm_id,
          algorithmType: selectedAlgorithm.type_name,
          algorithmName: selectedAlgorithm.name,
          hyperParameters: hyperParametersValues,
        },
        scenarioEditInfo: {
          scenarioName: intelligentStore.selectedScenario.name,
          agentRoleName: intelligentStore.selectedAgentRole.name,
          env_params: intelligentStore.selectedScenario.env_params.map(param => ({
            id: param.id,
            name: param.name,
            params: param.params.map(p => ({
              key: p[0],
              label: p[1],
              value: p[2]
            }))
          }))
        },
        model: loadedModel ? {
          id: loadedModel.model.id,
          img_url: loadedModel.model.img_url,
          name: loadedModel.model.name,
          nn_model_type: loadedModel.model.nn_model_type,
          time: loadedModel.model.time,
          model_path: loadedModel.model.model_path,
          select_model: loadedModel.model.select_model,
          role_name: loadedModel.model.role_name,
          scenario_name: loadedModel.model.scenario_name,
          version: loadedModel.model.version,
        } : null,
      };

      if (intelligentStore.trainingMode === 'offline' && intelligentStore.selectedDataset) {
        requestBody.offlineInfo = {
          OFFLINE_DATA_ID: intelligentStore.selectedDataset.OFFLINE_DATA_ID,
          DATASET_NAME: intelligentStore.selectedDataset.DATASET_NAME,
          SCENARIO_NAME: intelligentStore.selectedDataset.SCENARIO_NAME,
          AGENT_ROLE: intelligentStore.selectedDataset.AGENT_ROLE,
          DATA_STATE: intelligentStore.selectedDataset.DATA_STATE,
          DATA_ACTION: intelligentStore.selectedDataset.DATA_ACTION,
          DATASET_PATH: intelligentStore.selectedDataset.DATASET_PATH,
          CREAT_TIME: intelligentStore.selectedDataset.CREAT_TIME
        };
      }

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
            setTraining(false);
            if (statusData.result.status === "success") {
              message.success('训练完成，模型已保存！');
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
        setTraining(false);
        message.error('训练失败，请检查日志');
      }
    } catch (error) {
      setTraining(false);
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
        setTraining(false);
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

  const handleViewModelListClick = async () => {
    if (!intelligentStore.selectedScenario || !intelligentStore.selectedAgentRole || !intelligentStore.selectedAlgorithm || !intelligentStore.selectedAgent) {
      message.error("请先选择场景、角色、算法并载入智能体");
      return;
    }

    try {
      setLoadingModelList(true);
      
      const requestBody = {
        scenarioId: intelligentStore.selectedScenario.id,
        scenarioName: intelligentStore.selectedScenario.name,
        agentRoleId: intelligentStore.selectedAgentRole.id,
        agentRoleName: intelligentStore.selectedAgentRole.name,
        algorithmName: intelligentStore.selectedAlgorithm.name,
        agentId: intelligentStore.selectedAgent.agentID
      };
      const response = await fetch(__APP_CONFIG__.get_model_list, {
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
        setModelListData(data.models);
        
        setSubModelPublishStatus(prevStatus => {
          const updatedStatus = { ...prevStatus };
          data.models.forEach(record => {
            record.model.model_list.forEach(subModelId => {
              if (!(subModelId in updatedStatus)) {
                updatedStatus[subModelId] = false; 
              }
            });
          });
          return updatedStatus;
        });
        
        setIsModelListModalVisible(true);
      } else {
        message.error('获取模型列表失败: ' + data.message);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      message.error('获取模型列表失败，请检查网络或联系管理员');
    } finally {
      setLoadingModelList(false);
    }
  };

  const handleViewModel = (model) => {
    setCurrentModel(model);
    setIsModelInfoModalVisible(true);
  };

  const handleEffectModel = async (record) => {
    try {
      setEffectImageUrl(record);
      setIsEffectImageModalVisible(true);
    } catch (error) {
      console.error('获取效果图片失败:', error);
      message.error('获取效果图片失败，请检查网络或联系管理员');
    }
  };

  const handlePublish = async (record, subModelId) => {
    try {
      if (subModelPublishStatus[subModelId]) {
        setSubModelPublishStatus(prev => ({
          ...prev,
          [subModelId]: false
        }));
        message.success("模型已取消发布");
      } else {
        const response = await fetch(__APP_CONFIG__.publish_model, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decisionModelID: subModelId }),
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.status === 'success') {
          message.success("模型发布成功");
          setSubModelPublishStatus(prev => ({
            ...prev,
            [subModelId]: true
          }));
        } else {
          message.error('发布模型失败，请检查日志');
        }
      }
    } catch (error) {
      console.error('发布/取消发布模型失败:', error);
      message.error('操作失败，请检查网络或联系管理员');
    }
  };

  const handleLoadModel = async (record, subModelId) => {
    try {
      if (loadedModel && loadedModel.model.select_model === subModelId) {
        setLoadedModel(null);
        message.success("模型已取消载入！");
      } else {
        const modelToLoad = modelListData.find(
          (model) => model.model.model_list.includes(subModelId)
        );
        if (!modelToLoad) {
          message.error("未找到对应的模型");
          return;
        }
        const selectedAlgorithm = intelligentStore.selectedAlgorithm;
        if (!selectedAlgorithm) {
          message.error("请先选择算法！");
          return;
        }
        if (modelToLoad.algorithm.id !== selectedAlgorithm.algorithm_id) {
          message.error("模型与当前选择的算法不匹配，无法载入！");
          return;
        }
        setLoadedModel({
          ...modelToLoad,
          model: {
            ...modelToLoad.model,
            select_model: subModelId 
          }
        });
        message.success("模型载入成功！");
      }
    } catch (error) {
      console.error('模型载入/取消载入失败:', error);
      message.error('操作失败，请检查网络或联系管理员');
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
    { 
      title: '', 
      key: 'expand',
      width: 50,
      render: (text, record) => (
        <Button 
          type="text" 
          icon={<DownOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            setExpandedRowKeys(expandedRowKeys.includes(record.model.id) ? 
              expandedRowKeys.filter(key => key !== record.model.id) : 
              [...expandedRowKeys, record.model.id]);
          }}
          style={{
            transform: expandedRowKeys.includes(record.model.id) ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.3s'
          }}
        />
      ),
    },
    { 
      title: '训练ID', 
      dataIndex: ['model', 'id'], 
      key: 'modelId' 
    },
    { 
      title: '决策模型名称', 
      dataIndex: ['model', 'name'], 
      key: 'agentName' 
    },
    { 
      title: '智能体ID', 
      dataIndex: ['model', 'agentID'], 
      key: 'agentID' 
    },
    { 
      title: '场景名称', 
      dataIndex: ['model', 'scenario_name'], 
      key: 'scenarioName' 
    },
    { 
      title: '角色名称', 
      dataIndex: ['model', 'role_name'], 
      key: 'roleName' 
    },
    { 
      title: '模型类型', 
      dataIndex: ['model', 'nn_model_type'], 
      key: 'modelType' 
    },
    { 
      title: '模型版本', 
      dataIndex: ['model', 'version'], 
      key: 'modelVersion' 
    },
    { 
      title: '创建时间', 
      dataIndex: ['model', 'time'], 
      key: 'createTime', 
      render: time => new Date(time).toLocaleString() 
    },
    { 
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" onClick={() => handleViewModel(record)}>查看</Button>
          <Button type="primary" onClick={() => handleEffectModel(record.model.img_url)}>效果</Button>
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
        setDeploymentData(data.deployment_data); // Store deployment data instead of image URL
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
    console.log('Selected Agent:', intelligentStore.selectedAgent);
    console.log('Selected Scenario:', intelligentStore.selectedScenario);
    setIsProcessModalVisible(true);
};


  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  const expandedRowRender = (record) => {
    return (
      <Table
        columns={[
          { 
            title: '决策模型ID', 
            dataIndex: 'id', 
            key: 'modelId',
            render: (text) => text.split('-').pop() === '0' ? 
              `${text}` : text
          },
          { 
            title: '发布状态', 
            key: 'publishStatus',
            render: (text, subRecord) => subModelPublishStatus[subRecord.id] ? '已发布' : '未发布'
          },
          { 
            title: '载入状态(持续训练)', 
            key: 'loadStatus',
            render: (text, subRecord) => loadedModel && loadedModel.model.select_model === subRecord.id ? '已载入' : '未载入'  
          },
          { 
            title: '操作',
            key: 'action',
            render: (text, subRecord) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button 
                  type="primary" 
                  onClick={() => handlePublish(record, subRecord.id)}
                >
                  {subModelPublishStatus[subRecord.id] ? '取消发布' : '发布'}
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => handleLoadModel(record, subRecord.id)}
                >
                  {loadedModel && loadedModel.model.select_model === subRecord.id ? '取消载入' : '载入'}
                </Button>
              </div>
            ),
          },
        ]}
        dataSource={record.model.model_list.map(modelId => ({
          id: modelId,
          parentId: record.model.id
        }))}
        pagination={false}
        rowKey="id"
      />
    );
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
          <Row>
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
        gap: '16px',
        justifyContent: 'center',
        marginTop: '16px'
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
        title="模型列表"
        open={isModelListModalVisible}
        onOk={() => setIsModelListModalVisible(false)}
        onCancel={() => setIsModelListModalVisible(false)}
        width={1500}
      >
        <Table
          columns={modelListColumns}
          dataSource={modelListData}
          pagination={false}
          style={{ width: '100%' }}
          rowKey={(record) => record.model.id}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? 
                [...expandedRowKeys, record.model.id] : 
                expandedRowKeys.filter(key => key !== record.model.id));
            },
            expandIcon: ({ expanded, onExpand, record }) => null,
          }}
          loading={loadingModelList}
        />
      </Modal>

      <Modal
        title="模型详细信息"
        open={isModelInfoModalVisible}
        onOk={() => setIsModelInfoModalVisible(false)}
        onCancel={() => setIsModelInfoModalVisible(false)}
      >
        {currentModel && (
          <div>
            <p><strong>决策模型ID：</strong>{currentModel.model.id}</p>
            <p><strong>智能体名称：</strong>{currentModel.model.name}</p>
            <p><strong>场景名称：</strong>{currentModel.model.scenario_name}</p>
            <p><strong>角色名称：</strong>{currentModel.model.role_name}</p>
            <p><strong>模型版本：</strong>{currentModel.model.version}</p>
            <p><strong>模型类型：</strong>{currentModel.model.nn_model_type}</p>
            <p><strong>创建时间：</strong>{currentModel.model.time}</p>
            <p><strong>模型存放路径：</strong>{currentModel.model.model_path}</p>
            <p><strong>模型效果图路径：</strong>{currentModel.model.img_url}</p>
          </div>
        )}
      </Modal>

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
        onCancel={() => setIsProcessModalVisible(false)}
        destroyOnClose 
        footer={null}
        width={1200} 
      >
        {isProcessModalVisible && (
          <ProcessAnimation 
            agentId={intelligentStore.selectedAgent?.agentID} 
            scenarioId={intelligentStore.selectedScenario?.id}
          />
        )}
      </Modal>

    </div>
  );
});

export default AgentTrainingPanel;