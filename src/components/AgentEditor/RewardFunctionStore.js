import { makeAutoObservable } from 'mobx';

class RewardFunctionStore {
    selectedReward = []; // 选中的奖励函数
    visible = []; // 下拉框的可见状态
    isLoadingModel = false; // 是否正在载入模型

    constructor() {
        makeAutoObservable(this);
    }

    // 添加新的奖励函数
    addReward(reward) {
        this.selectedReward.push(reward);
        this.visible.push(false);
    }

    // 编辑奖励函数
    editReward(index, reward) {
        this.selectedReward[index] = reward;
    }

    // 删除奖励函数
    deleteReward(index) {
        this.selectedReward.splice(index, 1);
        this.visible.splice(index, 1);
    }

    // 切换下拉框的可见状态
    toggleDropdown(index) {
        this.visible[index] = !this.visible[index];
    }

    // 清空所有奖励函数状态
    clearRewards() {
        this.selectedReward = [];
        this.visible = [];
    }

    // 设置是否正在载入模型
    setLoadingModel(value) {
        this.isLoadingModel = value;
    }

    // 新增方法：获取所有奖励函数的内容
    getAllRewards() {
        return this.selectedReward;
    }
}

const rewardFunctionStore = new RewardFunctionStore();
export default rewardFunctionStore;