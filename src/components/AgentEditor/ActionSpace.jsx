import actionLogo from '../../assets/actionSpace.svg';
import uploadLogo from '../../assets/upload.svg';

const ActionSpace = () => {
    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={actionLogo} alt = "ActionSpace" className="sub-component-logo" />
                <div className="sub-component-title">动作空间</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt = "Upload" className="upload-button-logo" />
            </div>
        </div>
    );
};

export default ActionSpace;