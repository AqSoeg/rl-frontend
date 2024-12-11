import { useState } from 'react';
import { Button, Table } from 'antd';
import stateLogo from '../../assets/stateVector.svg';
import uploadLogo from '../../assets/upload.svg';

const StateVector = ({ simulation }) => {
    const [visible, setVisible] = useState(Array(simulation.VectorCount).fill(false));
    const [selectedVector, setSelectedVector] = useState(null);
    const [selectedVectorIndex, setSelectedVectorIndex] = useState(null);

    const handleSelectChange = (index) => {
        const newVisible = [...visible];
        newVisible[index] = !newVisible[index];
        setVisible(newVisible);
        setSelectedVector(simulation.Vectors[index]);
        setSelectedVectorIndex(index);
    };

    const columns = [
        { title: '变量名称', dataIndex: 'name', key: 'name' },
        { title: '变量信息', dataIndex: 'info', key: 'info' },
        { title: '单位', dataIndex: 'unit', key: 'unit' },
    ];

    const getTableData = (vector) => {
        if (vector.Variables.length === 0) {
            return [{ name: '', info: '', unit: '' }];
        }
        return vector.Variables;
    };

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={stateLogo} alt="StateVector" className="sub-component-logo" />
                <div className="sub-component-title">状态向量</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt="Upload" className="upload-button-logo" />
            </div>
            <div className="dropdown-container-wrapper">
                {Array.from({ length: simulation.VectorCount }, (_, i) => (
                    <div key={i} className="dropdown-container">
                        <div className="dropdown-header" onClick={() => handleSelectChange(i)}>
                            <span>状态观测{i + 1}</span>
                            <Button type="link" className="dropdown-button">
                                {visible[i] ? '▲' : '▼'}
                            </Button>
                        </div>
                        {visible[i] && (
                            <div className="table-container">
                                <Table
                                    columns={columns}
                                    dataSource={getTableData(selectedVector || { Variables: [] })}
                                    pagination={false}
                                    scroll={{ y: 240 }}
                                    className="fixed-table"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StateVector;