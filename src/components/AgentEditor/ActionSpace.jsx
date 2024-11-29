// ActionSpace.jsx
import { useState } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import './AgentEditor.css';

const { Option } = Select;

const ActionSpace = ({ mockAction }) => {
    const [visible, setVisible] = useState(Array(mockAction.ActionCount).fill(false));
    const [selectedAction, setSelectedAction] = useState(Array(mockAction.ActionCount).fill(null));
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [meaning, setMeaning] = useState('');

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedActionIndex(index);
        setSelectedType(selectedAction[index]?.selectedType || null);
        setSelectedOption(selectedAction[index]?.selectedOption || null);
        setMeaning(selectedAction[index]?.meaning || '');
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setSelectedOption(null); // 重置选中的选项
        setMeaning(''); // 重置含义
    };

    const handleOptionChange = (value) => {
        setSelectedOption(value);
        const optionMeaning = mockAction.Actions[selectedActionIndex]?.types
            .find((type) => type.name === selectedType)
            ?.options.find((option) => option.name === value)?.meaning;
        setMeaning(optionMeaning || '');
    };

    const handleConfirm = () => {
        if (!selectedType || !selectedOption) {
            alert('请选择完毕后再确认，否则取消！');
            return;
        }

        const newSelectedAction = [...selectedAction];
        newSelectedAction[selectedActionIndex] = {
            selectedType: selectedType,
            selectedOption: selectedOption,
            meaning: meaning,
        };
        setSelectedAction(newSelectedAction);
        handleSelectChange(selectedActionIndex); // 收起下拉框
    };

    const handleCancel = () => {
        const confirmCancel = window.confirm('是否取消该动作？');
        if (confirmCancel) {
            const newSelectedAction = [...selectedAction];
            newSelectedAction[selectedActionIndex] = null;
            setSelectedAction(newSelectedAction);
            handleSelectChange(selectedActionIndex); // 收起下拉框
        }
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={actionLogo} alt="ActionSpace" className="sub-component-logo" />
                <div className="sub-component-title">动作空间</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt="Upload" className="upload-button-logo" />
            </div>
            <div className="dropdown-container-wrapper">
                {Array.from({ length: mockAction.ActionCount }, (_, i) => (
                    <div key={i} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>动作{i + 1}</span>
                            <Button type="link" className="dropdown-button">
                                {visible[i] ? '▲' : '▼'}
                            </Button>
                        </div>
                        {visible[i] && (
                            <div className="action-container">
                                <div className="action-row">
                                    <span>动作种类：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={handleTypeChange}
                                        value={selectedType || selectedAction[i]?.selectedType || null}
                                    >
                                        {mockAction.Actions[i]?.types.map((type, index) => (
                                            <Option key={index} value={type.name}>
                                                {type.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="action-row">
                                    <span>可选动作：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={handleOptionChange}
                                        value={selectedOption || selectedAction[i]?.selectedOption || null}
                                        disabled={!selectedType}
                                    >
                                        {selectedType && mockAction.Actions[i]?.types
                                            .find((type) => type.name === selectedType)
                                            ?.options.map((option, index) => (
                                                <Option key={index} value={option.name}>
                                                    {option.name}
                                                </Option>
                                            ))}
                                    </Select>
                                </div>
                                <div className="action-row">
                                    <span className="meaning-label">含义：</span>
                                    <Input
                                        placeholder={meaning ? meaning : "单行输入"}
                                        value={meaning}
                                        disabled={!selectedOption}
                                        className="meaning-input"
                                    />
                                </div>
                                <div className="action-buttons">
                                    <Button type="primary" onClick={handleConfirm}>
                                        确定
                                    </Button>
                                    <Button onClick={handleCancel}>
                                        取消
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActionSpace;