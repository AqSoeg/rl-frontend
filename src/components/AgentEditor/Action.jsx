import { useState, useEffect } from 'react';
import { Button, Select, Input } from 'antd';
import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';
import addLogo from "../../assets/add.svg";

const ActionSpace = ({ entities }) => {

    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={actionLogo} alt="ActionSpace" className="sub-component-logo"/>
                <div className="sub-component-title">动作空间</div>
            </div>
            <div className="upload-button">
                <img
                    src={addLogo}
                    alt="Add Function"
                    className="upload-button-logo"
                    onClick={isAddButtonEnabled ? handleAddAction : null}
                    style={{
                        cursor: isAddButtonEnabled ? 'pointer' : 'not-allowed',
                        opacity: isAddButtonEnabled ? 1 : 0.5,
                        marginRight: '20px'
                    }}
                />
                <img src={uploadLogo} alt="Upload" className="upload-button-logo"/>
            </div>
            <div className="dropdown-container-wrapper">
            </div>
        </div>
            );

};

export default ActionSpace;