// RewardFunction.jsx
import { useState } from 'react';
import { Button, Input } from 'antd';
import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';
import './AgentEditor.css';

const RewardFunction = ({ mockReward }) => {
    const [visible, setVisible] = useState(Array(mockReward.RewardCount).fill(false));
    const [selectedReward, setSelectedReward] = useState(Array(mockReward.RewardCount).fill(null));
    const [selectedRewardIndex, setSelectedRewardIndex] = useState(null);
    const [name, setName] = useState('');
    const [equation, setEquation] = useState('');
    const [meaning, setMeaning] = useState('');

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedRewardIndex(index);
        setName(selectedReward[index]?.name || '');
        setEquation(selectedReward[index]?.equation || '');
        setMeaning(selectedReward[index]?.meaning || '');
    };

    const handleConfirm = () => {
        if (!name || !equation || !meaning) {
            alert('请填写完毕后再确认，否则取消！');
            return;
        }

        const newSelectedReward = [...selectedReward];
        newSelectedReward[selectedRewardIndex] = {
            name: name,
            equation: equation,
            meaning: meaning,
        };
        setSelectedReward(newSelectedReward);
        handleSelectChange(selectedRewardIndex); // 收起下拉框
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消该奖赏函数？');
        if (confirmCancel) {
            const newSelectedReward = [...selectedReward];
            newSelectedReward[selectedRewardIndex] = null;
            setSelectedReward(newSelectedReward);
            handleSelectChange(selectedRewardIndex); // 收起下拉框
        }
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={rewardLogo} alt="RewardFunction" className="sub-component-logo" />
                <div className="sub-component-title">奖赏函数</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt="Upload" className="upload-button-logo" />
            </div>
            <div className="dropdown-container-wrapper">
                {Array.from({ length: mockReward.RewardCount }, (_, i) => (
                    <div key={i} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>奖励函数{i + 1}</span>
                            <Button type="link" className="dropdown-button">
                                {visible[i] ? '▲' : '▼'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RewardFunction;