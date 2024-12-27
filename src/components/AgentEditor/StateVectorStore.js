// StateVectorStore.js
import { makeAutoObservable } from 'mobx';

class StateVectorStore {
    selectedStateVectors = {}; // 存储用户选择的状态向量

    constructor() {
        makeAutoObservable(this);
    }

    // 设置选择的状态向量
    setSelectedStateVectors(selectedStateVectors) {
        this.selectedStateVectors = selectedStateVectors;
    }

    // 获取选择的状态向量
    getSelectedStateVectors() {
        return this.selectedStateVectors;
    }
}

const stateVectorStore = new StateVectorStore();
export default stateVectorStore;