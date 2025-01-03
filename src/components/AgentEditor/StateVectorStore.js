import { makeAutoObservable } from 'mobx';

class StateVectorStore {
    selectedStateVectors = {};

    constructor() {
        makeAutoObservable(this);
    }

    setSelectedStateVectors(selectedStateVectors) {
        this.selectedStateVectors = selectedStateVectors;
    }

    getSelectedStateVectors() {
        return this.selectedStateVectors;
    }
}

const stateVectorStore = new StateVectorStore();
export default stateVectorStore;