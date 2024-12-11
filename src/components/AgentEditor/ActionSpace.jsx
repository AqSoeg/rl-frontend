import { useState } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';

const { Option } = Select;

const ActionSpace = ({ mockAction }) => {
    const [visible, setVisible] = useState(Array(mockAction.ActionCount).fill(false));
    const [selectedAction, setSelectedAction] = useState(Array(mockAction.ActionCount).fill(null));
    const [selectedActionIndex, setSelectedActionIndex] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [meaning, setMeaning] = useState('');
    const [ruleVisible, setRuleVisible] = useState(Array(mockAction.ActionCount).fill(false));
    const [ruleType, setRuleType] = useState(Array(mockAction.ActionCount).fill(null));
    const [condition1, setCondition1] = useState(Array(mockAction.ActionCount).fill(''));
    const [condition2, setCondition2] = useState(Array(mockAction.ActionCount).fill(''));
    const [execution1, setExecution1] = useState(Array(mockAction.ActionCount).fill(''));
    const [execution2, setExecution2] = useState(Array(mockAction.ActionCount).fill(''));

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

    const handleRuleClick = (index) => {
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = !newRuleVisible[index];
        setRuleVisible(newRuleVisible);
    };

    const handleRuleTypeChange = (index, value) => {
        const newRuleType = [...ruleType];
        newRuleType[index] = value;
        setRuleType(newRuleType);
    };

    const handleCondition1Change = (index, value) => {
        const newCondition1 = [...condition1];
        newCondition1[index] = value;
        setCondition1(newCondition1);
    };

    const handleCondition2Change = (index, value) => {
        const newCondition2 = [...condition2];
        newCondition2[index] = value;
        setCondition2(newCondition2);
    };

    const handleExecution1Change = (index, value) => {
        const newExecution1 = [...execution1];
        newExecution1[index] = value;
        setExecution1(newExecution1);
    };

    const handleExecution2Change = (index, value) => {
        const newExecution2 = [...execution2];
        newExecution2[index] = value;
        setExecution2(newExecution2);
    };

    const handleRuleConfirm = (index) => {
        // 处理规则确认逻辑
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = false;
        setRuleVisible(newRuleVisible);
    };

    const handleRuleCancel = (index) => {
        const newRuleVisible = [...ruleVisible];
        newRuleVisible[index] = false;
        setRuleVisible(newRuleVisible);
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
                            <div className="button-group">
                                <Button type="link" className="dropdown-button">
                                    {visible[i] ? '▲' : '▼'}
                                </Button>
                                <div className="blue-divider"></div>
                                <div
                                    className={`rule-button ${ruleVisible[i] ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRuleClick(i);
                                    }}
                                >
                                    行为规则
                                </div>
                            </div>
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
                        {ruleVisible[i] && (
                            <div className="rule-container">
                                <div className="rule-row">
                                    <span>规则类型：</span>
                                    <Select
                                        style={{ width: 200 }}
                                        onChange={(value) => handleRuleTypeChange(i, value)}
                                        value={ruleType[i] || null}
                                    >
                                        <Option value="IF ELSE">IF ELSE</Option>
                                        <Option value="WHILE">WHILE</Option>
                                        <Option value="MAX">MAX</Option>
                                        <Option value="MIN">MIN</Option>
                                    </Select>
                                </div>
                                <div className="rule-row">
                                    <span>条件1：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={condition1[i]}
                                        onChange={(e) => handleCondition1Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>条件2：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={condition2[i]}
                                        onChange={(e) => handleCondition2Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>执行内容1：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={execution1[i]}
                                        onChange={(e) => handleExecution1Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-row">
                                    <span>执行内容2：</span>
                                    <Input
                                        placeholder="单行输入"
                                        value={execution2[i]}
                                        onChange={(e) => handleExecution2Change(i, e.target.value)}
                                        className="common-input"
                                    />
                                </div>
                                <div className="rule-buttons">
                                    <Button type="primary" onClick={() => handleRuleConfirm(i)}>
                                        确定
                                    </Button>
                                    <Button onClick={() => handleRuleCancel(i)}>
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