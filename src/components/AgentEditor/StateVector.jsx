import stateLogo from '../../assets/stateVector.svg';
import uploadLogo from '../../assets/upload.svg';

const StateVector = () => {
    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={stateLogo} alt = "StateVector" className="sub-component-logo" />
                <div className="sub-component-title">状态向量</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt = "Upload" className="upload-button-logo" />
            </div>
        </div>
    );
};

export default StateVector;