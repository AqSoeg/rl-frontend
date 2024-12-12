import { makeAutoObservable} from "mobx";
import axios from "axios";

class ScenarioStore {
    scenarios = [];

    constructor() {
        makeAutoObservable(this);
    }

    // 获取所有场景数据
    fetchScenarios = async () => {
        try {
            const response = await axios.get('http://localhost:3000/scenarios');
            this.scenarios = response.data;
        } catch (error) {
            console.error('Error fetching scenarios:', error);
        }
    }
}

const scenarioStore = new ScenarioStore();
export default scenarioStore;