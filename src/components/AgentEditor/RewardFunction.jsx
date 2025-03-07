import { useState, useEffect } from 'react';
import { Button, Select, Modal, Form } from 'antd';
import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';
import addLogo from '../../assets/add.svg';
import sidebarStore from './SidebarStore';
import rewardFunctionStore from './RewardFunctionStore';
import { observer } from 'mobx-react';

const { Option } = Select;

const RewardFunction = observer(({ selectedParams }) => {
    const [equation, setEquation] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [rewardWhoOpen, setRewardWhoOpen] = useState(false);
    const [rewardType, setRewardType] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [hoveredParam, setHoveredParam] = useState(null);

    const isAddButtonEnabled = sidebarStore.agentCount > 0;

    useEffect(() => {
        if (rewardFunctionStore.isLoadingModel) {
            rewardFunctionStore.setLoadingModel(false);
            return;
        }
        if (sidebarStore.agentCount || sidebarStore.type || sidebarStore.role || sidebarStore.scenario) {
            rewardFunctionStore.clearRewards();
        }
    }, [sidebarStore.agentCount, sidebarStore.type, sidebarStore.role, sidebarStore.scenario]);

    const handleAddReward = () => {
        if (sidebarStore.type === '同构多智能体') {
            setRewardType('团队奖励');
            setModalOpen(true);
        } else if (sidebarStore.agentCount > 1) {
            setRewardWhoOpen(true);
        } else {
            setRewardType('团队奖励');
            setSelectedAgent('智能体1');
            setModalOpen(true);
        }
        setEquation('');
    };

    const handleRewardWhoConfirm = (type, agent) => {
        setRewardType(type);
        setSelectedAgent(agent);
        setRewardWhoOpen(false);
        setModalOpen(true);
        setEquation('');
    };

    const handleRewardWhoCancel = () => {
        setRewardWhoOpen(false);
    };

    const handleRewardTypeChange = (value) => {
        setRewardType(value);
    };

    const handleAgentChange = (value) => {
        setSelectedAgent(value);
    };

    const handleConfirm = () => {
        if (!equation) {
            alert('请填写公式后再确认，否则取消！');
            return;
        }

        const newReward = {
            equation: equation,
            type: rewardType,
            agent: selectedAgent,
        };

        if (editingIndex !== null) {
            rewardFunctionStore.editReward(editingIndex, newReward);
            setEditingIndex(null);
        } else {
            rewardFunctionStore.addReward(newReward);
        }

        setModalOpen(false);
        setEquation('');
    };

    const handleCancel = () => {
        setModalOpen(false);
        setEditingIndex(null);
        setEquation('');
    };

    const handleEquationChange = (e) => setEquation(e.target.value);

    const handleDropdownClick = (index) => {
        rewardFunctionStore.toggleDropdown(index);
    };

    const handleEdit = (index) => {
        const reward = rewardFunctionStore.selectedReward[index];
        setEquation(reward.equation);
        setRewardType(reward.type);
        setSelectedAgent(reward.agent);
        setEditingIndex(index);
        setModalOpen(true);
    };

    const handleDelete = (index) => {
        const confirmDelete = window.confirm('是否确认删除该奖赏函数？');
        if (confirmDelete) {
            rewardFunctionStore.deleteReward(index);
        }
    };

    const handleParamHover = (param) => {
        setIsHovering(true);
        setHoveredParam(param);
    };

    const handleParamLeave = () => {
        setIsHovering(false);
        setHoveredParam(null);
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={rewardLogo} alt="RewardFunction" className="sub-component-logo" />
                <div className="sub-component-title">奖赏函数</div>
            </div>
            <div className="upload-button">
                <img
                    src={addLogo}
                    alt="Add Function"
                    className="upload-button-logo"
                    onClick={isAddButtonEnabled ? handleAddReward : null}
                    style={{
                        cursor: isAddButtonEnabled ? 'pointer' : 'not-allowed',
                        opacity: isAddButtonEnabled ? 1 : 0.5,
                        marginRight: '20px'
                    }}
                />
                <img src={uploadLogo} alt="Upload" className="upload-button-logo"/>
            </div>
            <div className="dropdown-container-wrapper">
                {rewardFunctionStore.selectedReward.map((reward, index) => (
                    <div key={index} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleDropdownClick(index)}>
                            <span>{reward.equation}</span>
                            <Button type="link" className="dropdown-button">
                                {rewardFunctionStore.visible[index] ? '▲' : '▼'}
                            </Button>
                        </div>
                        {rewardFunctionStore.visible[index] && (
                            <div className="dropdown-content">
                                <div>
                                    {reward.type === '团队奖励' ? '团队奖励' : `个人奖励 - ${reward.agent}`}
                                </div>
                                <div>
                                    <Button type="link" onClick={() => handleEdit(index)}>编辑</Button>
                                    <Button type="link" onClick={() => handleDelete(index)}>删除</Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                title="选择奖励类型"
                open={rewardWhoOpen}
                onCancel={handleRewardWhoCancel}
                footer={[
                    <Button key="cancel" onClick={handleRewardWhoCancel}>取消</Button>,
                    <Button key="confirm" type="primary" onClick={() => handleRewardWhoConfirm(rewardType, selectedAgent)}>确认</Button>,
                ]}
            >
                <Form layout="vertical">
                    <Form.Item label="奖励类型">
                        <Select value={rewardType} onChange={handleRewardTypeChange} style={{ width: '100%' }}>
                            <Option value="团队奖励">团队奖励</Option>
                            <Option value="个人奖励">个人奖励</Option>
                        </Select>
                    </Form.Item>
                    {rewardType === '个人奖励' && (
                        <Form.Item label="选择智能体">
                            <Select value={selectedAgent} onChange={handleAgentChange} style={{ width: '100%' }}>
                                {Array.from({ length: sidebarStore.agentCount }, (_, i) => (
                                    <Option key={i} value={`智能体${i + 1}`}>智能体{i + 1}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            {modalOpen && (
                <div className="reward-modal-overlay">
                    <div className="reward-modal">
                        <div className="reward-modal-header">奖励函数公式编辑器</div>
                        <div className="equation-preview">
                            {equation}
                        </div>
                        <div className="symbol-groups">
                            <div className="symbol-group">
                                {["+", "-", "×", "÷", "^", "√", "sin", "cos", "tan", "log", "ln", "∏", "∑", "∧", "∨", "¬", "⊕", "[", "]", "(", ")", "=", "≈", "∂", "e", "π", "∈", "±"].map((symbol, index) => (
                                    <button key={index}
                                            onClick={() => handleEquationChange({target: {value: equation + symbol}})}>{symbol}</button>
                                ))}
                            </div>
                            <div className="symbol-group">
                                {selectedParams.map((param, index) => (
                                    <button key={index}
                                            onMouseEnter={() => handleParamHover(param)}
                                            onMouseLeave={handleParamLeave}
                                            onClick={() => handleEquationChange({target: {value: equation + param[0]}})}>{param[0]}</button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            className="equation-input"
                            value={equation}
                            onChange={handleEquationChange}
                            placeholder="在此输入或编辑公式"
                        />
                        <div className="modal-buttons">
                            <Button onClick={handleCancel}>取消</Button>
                            <Button type="primary" onClick={handleConfirm}>确认</Button>
                        </div>
                    </div>

                    {isHovering && hoveredParam && (
                        <div className="tooltip">
                            <div className="tooltip-content">
                                <div className="tooltip-title">{hoveredParam[0]}</div>
                                <div className="tooltip-description">{hoveredParam[1]}</div>
                                <div className="tooltip-unit">{hoveredParam[2]}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

export default RewardFunction;