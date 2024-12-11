import { useState } from 'react';
import { Button, Input } from 'antd';
import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';
import RewardModal from './RewardModal';

const RewardFunction = ({ mockReward }) => {
    const [visible, setVisible] = useState(Array(mockReward.RewardCount).fill(false));
    const [selectedReward, setSelectedReward] = useState(Array(mockReward.RewardCount).fill(null));
    const [selectedRewardIndex, setSelectedRewardIndex] = useState(null);
    const [equation, setEquation] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedRewardIndex(index);
        setEquation(selectedReward[index]?.equation || '');
        setModalVisible(true); // 显示弹窗
    };

    const handleConfirm = () => {
        if (!equation) {
            alert('请填写公式后再确认，否则取消！');
            return;
        }

        const newSelectedReward = [...selectedReward];
        newSelectedReward[selectedRewardIndex] = {
            equation: equation,
        };
        setSelectedReward(newSelectedReward);
        setModalVisible(false); // 隐藏弹窗
        handleSelectChange(selectedRewardIndex); // 收起下拉框
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消该奖赏函数？');
        if (confirmCancel) {
            const newSelectedReward = [...selectedReward];
            newSelectedReward[selectedRewardIndex] = null;
            setSelectedReward(newSelectedReward);
            setModalVisible(false); // 隐藏弹窗
            handleSelectChange(selectedRewardIndex); // 收起下拉框
        }
    };

    const handleEquationChange = (e) => setEquation(e.target.value);

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
            <RewardModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onConfirm={handleConfirm}
                equation={equation}
                onEquationChange={handleEquationChange}
            />
        </div>
    );
};

export default RewardFunction;