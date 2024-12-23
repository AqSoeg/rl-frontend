import { makeAutoObservable } from 'mobx';

class RewardFunctionStore {
    selectedReward = []; // 选中的奖励函数
    visible = []; // 下拉框的可见状态

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
}

const rewardFunctionStore = new RewardFunctionStore();
export default rewardFunctionStore;