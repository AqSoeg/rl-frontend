const RewardModal = ({ visible, onCancel, onConfirm, equation, onEquationChange }) => {
    const equationSymbols = [
        "+", "-", "×", "÷", "^", "√", "sin", "cos", "tan", "log", "ln", "∏", "∑", "∧", "∨", "¬", "⊕", "[", "]", "(", ")", "=", "≈", "∂", "e", "π", "∈", "±"
    ];
    const letterSymbols = [
        "s'", "a'", 'Q', 'Q̄', 't', 'T', 'ω', 'a_t', 's_t', 'r', 'μ', 'π',
    ];

    const handleSymbolClick = (symbol) => {
        onEquationChange({ target: { value: equation + symbol } });
    };

    if (!visible) return null;

    return (
        <div className="reward-modal-overlay">
            <div className="reward-modal">
                <div className="reward-modal-header">
                    <h2>奖励函数公式编辑器</h2>
                </div>
                <div className="symbol-groups">
                    <div className="symbol-group">
                        {equationSymbols.map((symbol, index) => (
                            <button key={index} onClick={() => handleSymbolClick(symbol)}>{symbol}</button>
                        ))}
                    </div>
                    <div className="symbol-group">
                        {letterSymbols.map((symbol, index) => (
                            <button key={index} onClick={() => handleSymbolClick(symbol)}>{symbol}</button>
                        ))}
                    </div>
                </div>
                <textarea
                    className="equation-input"
                    value={equation}
                    onChange={onEquationChange}
                    placeholder="在此输入或编辑公式"
                />
                <div className="equation-preview">
                    {equation}
                </div>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={onConfirm}>确认</button>
                    <button className="cancel-button" onClick={onCancel}>取消</button>
                </div>
            </div>
        </div>
    );
};

export default RewardModal;