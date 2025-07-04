import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const appConfig = {
  scenarios: "http://localhost:5000/scenarios",
  getModels: "http://localhost:5000/getModels",
  saveModel: "http://localhost:5000/saveModel",
  evaluateDataGenerate: "http://localhost:5000/evaluateDataGenerate",
  viewEvaluationData: "http://localhost:5000/viewEvaluationData",
  loadEvaluationData: "http://localhost:5000/loadEvaluationData",
  startEvaluation: "http://localhost:5000/startEvaluation",
  get_algorithm:"http://localhost:5000/get_algorithm",
  train:"http://localhost:5000/train",
  stop_training: "http://localhost:5000/stop_training",
  training_status:"http://localhost:5000/training_status",
  publish_model:"http://localhost:5000/publish_model",
  get_datasets:"http://localhost:5000/get_datasets",
  getDecisionModels:"http://localhost:5000/getDecisionModels",
  getEvaluateTables:"http://localhost:5000/getEvaluateTables",
  searchAll:"http://localhost:5000/searchAll",
  deleteAll:"http://localhost:5000/deleteAll",
  updateAll:"http://localhost:5000/updateAll",
  addAll:"http://localhost:5000/addAll",
  updateDbJson:"http://localhost:5000/updateDbJson",
  get_deployment_image:"http://localhost:5000/get_deployment_image",
  get_process_data:"http://localhost:5000/get_process_data",
  load_dataset:"http://localhost:5000/load_dataset",
  get_model_list:"http://localhost:5000/get_model_list",
  socketiourl: "http://localhost:5000",
  getExtraDecisionModels:"http://localhost:5000/getExtraDecisionModels",
  startTraining: "http://localhost:5000/startTraining",
  uploadFile: "http://localhost:5000/uploadFile",
  websocketUrl: "ws://localhost:8080", // WebSocket 服务器地址
  
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_CONFIG__: JSON.stringify(appConfig)
  }
});