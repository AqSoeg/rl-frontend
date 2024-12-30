import { useState, useEffect } from 'react';
import { Button, Select, Modal, Form } from 'antd';
import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';
import addLogo from '../../assets/add.svg';
import sidebarStore from './SidebarStore';
import rewardFunctionStore from './RewardFunctionStore'; // 引入 RewardFunctionStore
import { observer } from 'mobx-react';

const { Option } = Select;

const RewardFunction = observer(({ selectedParams }) => { // 新增：接收 selectedParams
    const [equation, setEquation] = useState(''); // 公式内容
    const [modalOpen, setModalOpen] = useState(false); // 控制 RewardModal 的打开与关闭
    const [rewardWhoOpen, setRewardWhoOpen] = useState(false); // 控制 RewardWho 弹窗的打开与关闭
    const [rewardType, setRewardType] = useState(''); // 奖励类型
    const [selectedAgent, setSelectedAgent] = useState(''); // 选中的智能体
    const [editingIndex, setEditingIndex] = useState(null); // 用于记录当前编辑的下拉框索引

    // 检查智能体数量是否大于 0
    const isAddButtonEnabled = sidebarStore.agentCount > 0;

    // 监听 SidebarStore 的状态变化
    useEffect(() => {
        if (sidebarStore.agentCount || sidebarStore.type || sidebarStore.role || sidebarStore.scenario) {
            rewardFunctionStore.clearRewards(); // 清空奖励函数状态
        }
    }, [sidebarStore.agentCount, sidebarStore.type, sidebarStore.role, sidebarStore.scenario]);

    // 处理新增奖励函数
    const handleAddReward = () => {
        if (sidebarStore.type === '同构多智能体') {
            // 如果是同构多智能体，直接打开 RewardModal 并设置为团队奖励
            setRewardType('团队奖励');
            setModalOpen(true);
        } else if (sidebarStore.agentCount > 1) {
            setRewardWhoOpen(true);
        } else {
            // 智能体数量为 1 时，默认是团队奖励
            setRewardType('团队奖励');
            setSelectedAgent('智能体1');
            setModalOpen(true);
        }
        setEquation(''); // 新增时，公式内容为空
    };

    // 处理 RewardWho 弹窗确认
    const handleRewardWhoConfirm = (type, agent) => {
        setRewardType(type);
        setSelectedAgent(agent);
        setRewardWhoOpen(false);
        setModalOpen(true);
        setEquation(''); // 新增时，公式内容为空
    };

    // 处理 RewardWho 弹窗取消
    const handleRewardWhoCancel = () => {
        setRewardWhoOpen(false);
    };

    // 处理奖励类型变化
    const handleRewardTypeChange = (value) => {
        setRewardType(value);
    };

    // 处理智能体选择变化
    const handleAgentChange = (value) => {
        setSelectedAgent(value);
    };

    // 处理确认按钮点击
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
            // 如果正在编辑，更新原来的奖励函数
            rewardFunctionStore.editReward(editingIndex, newReward);
            setEditingIndex(null); // 重置编辑状态
        } else {
            // 否则添加新的奖励函数
            rewardFunctionStore.addReward(newReward);
        }

        setModalOpen(false);
        setEquation(''); // 清空公式输入框
    };

    // 处理取消按钮点击
    const handleCancel = () => {
        setModalOpen(false); // 直接关闭弹窗
        setEditingIndex(null); // 重置编辑状态
        setEquation(''); // 清空公式输入框
    };

    // 处理公式输入变化
    const handleEquationChange = (e) => setEquation(e.target.value);

    // 处理下拉框点击
    const handleDropdownClick = (index) => {
        rewardFunctionStore.toggleDropdown(index);
    };

    // 处理编辑按钮点击
    const handleEdit = (index) => {
        const reward = rewardFunctionStore.selectedReward[index];
        setEquation(reward.equation); // 设置为之前的公式
        setRewardType(reward.type); // 设置为之前的奖励类型
        setSelectedAgent(reward.agent); // 设置为之前的智能体
        setEditingIndex(index); // 设置当前编辑的下拉框索引
        setModalOpen(true);
    };

    // 处理删除按钮点击
    const handleDelete = (index) => {
        const confirmDelete = window.confirm('是否确认删除该奖赏函数？');
        if (confirmDelete) {
            rewardFunctionStore.deleteReward(index);
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

            {/* RewardWho 弹窗 */}
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

            {/* RewardModal 弹窗 */}
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
                                {selectedParams.map((symbol, index) => ( // 修改：动态显示 selectedParams
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
                        <div className="modal-buttons">
                            <Button onClick={handleCancel}>取消</Button>
                            <Button type="primary" onClick={handleConfirm}>确认</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default RewardFunction;