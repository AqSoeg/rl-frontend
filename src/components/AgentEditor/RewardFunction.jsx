import rewardLogo from '../../assets/rewardFunction.svg';
import uploadLogo from '../../assets/upload.svg';

const RewardFunction = () => {
    return (
        <div className="sub-component">
            <div className="sub-component-banner">
                <img src={rewardLogo} alt = "RewardFunction" className="sub-component-logo" />
                <div className="sub-component-title">奖赏函数</div>
            </div>
            <div className="upload-button">
                <img src={uploadLogo} alt = "Upload" className="upload-button-logo" />
            </div>
        </div>
    );
};

export default RewardFunction;