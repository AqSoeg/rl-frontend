import { useState } from 'react';
import { Button, Select, Modal, Form } from 'antd';
import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';
import addFunctionLogo from '../../assets/addFunction.svg';
import sidebarStore from './SidebarStore';

const { Option } = Select;

const RewardFunction = () => {
    const [visible, setVisible] = useState(Array(sidebarStore.agentCount).fill(false));
    const [selectedReward, setSelectedReward] = useState([]);
    const [selectedRewardIndex, setSelectedRewardIndex] = useState(null);
    const [equation, setEquation] = useState('');
    const [modalOpen, setModalOpen] = useState(false); // 使用 open 代替 visible
    const [rewardWhoOpen, setRewardWhoOpen] = useState(false); // 使用 open 代替 visible
    const [rewardType, setRewardType] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');

    // 检查智能体数量是否大于 0
    const isAddButtonEnabled = sidebarStore.agentCount > 0;

    const handleAddReward = () => {
        if (sidebarStore.agentCount > 1) {
            setRewardWhoOpen(true); // 使用 open
        } else {
            // 智能体数量为 1 时，默认是团队奖励
            setRewardType('团队奖励');
            setModalOpen(true); // 使用 open
        }
    };

    const handleRewardWhoConfirm = (type, agent) => {
        setRewardType(type);
        setSelectedAgent(agent);
        setRewardWhoOpen(false); // 使用 open
        setModalOpen(true); // 使用 open
    };

    const handleRewardWhoCancel = () => {
        setRewardWhoOpen(false); // 使用 open
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

        const newSelectedReward = [...selectedReward];
        newSelectedReward.push({
            equation: equation,
            type: rewardType,
            agent: selectedAgent,
        });
        setSelectedReward(newSelectedReward);
        setModalOpen(false); // 使用 open
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消编辑该奖赏函数？');
        if (confirmCancel) {
            setModalOpen(false); // 使用 open
        }
    };

    const handleEquationChange = (e) => setEquation(e.target.value);

    const handleDropdownClick = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedRewardIndex(index);
    };

    const handleEdit = (index) => {
        setEquation(selectedReward[index].equation);
        setRewardType(selectedReward[index].type);
        setSelectedAgent(selectedReward[index].agent);
        setModalOpen(true); // 使用 open
    };

    const handleDelete = (index) => {
        const confirmDelete = window.confirm('是否确认删除该奖赏函数？');
        if (confirmDelete) {
            const newSelectedReward = [...selectedReward];
            newSelectedReward.splice(index, 1);
            setSelectedReward(newSelectedReward);
        }
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={rewardLogo} alt="RewardFunction" className="sub-component-logo" />
                <div className="sub-component-title">奖赏函数</div>
            </div>
            <div className="upload-button">
                <img
                    src={addFunctionLogo}
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
                {selectedReward.map((reward, index) => (
                    <div key={index} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleDropdownClick(index)}>
                            <span>{reward.equation}</span> {/* 下拉框名是公式 */}
                            <Button type="link" className="dropdown-button">
                                {visible[index] ? '▲' : '▼'}
                            </Button>
                        </div>
                        {visible[index] && (
                            <div className="dropdown-content">
                                <div>
                                    {reward.type === '团队奖励' ? '团队奖励' : `个人奖励 - ${reward.agent}`} {/* 第一行显示奖励信息和智能体 */}
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

            {/* RewardWho 弹窗 */}
            <Modal
                title="选择奖励类型"
                open={rewardWhoOpen} // 使用 open 代替 visible
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

            {/* RewardModal 弹窗 */}
            <Modal
                title="奖励函数公式编辑器"
                open={modalOpen} // 使用 open 代替 visible
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>取消</Button>,
                    <Button key="confirm" type="primary" onClick={handleConfirm}>确认</Button>,
                ]}
            >
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
                        {["s'", "a'", 'Q', 'Q̄', 't', 'T', 'ω', 'a_t', 's_t', 'r', 'μ', 'π'].map((symbol, index) => (
                            <button key={index}
                                    onClick={() => handleEquationChange({target: {value: equation + symbol}})}>{symbol}</button>
                        ))}
                    </div>
                </div>
                <textarea
                    className="equation-input"
                    value={equation}
                    onChange={handleEquationChange}
                    placeholder="在此输入或编辑公式"
                />
            </Modal>
        </div>
    );
};

export default RewardFunction;