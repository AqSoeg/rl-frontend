import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const appConfig = {
  scenarios: "http://localhost:5000/scenarios",
  getModels: "http://localhost:5000/getModels",
  saveModel: "http://localhost:5000/saveModel",
  loadEvaluationData: "http://localhost:5000/loadEvaluationData",
  startEvaluation: "http://localhost:5000/startEvaluation",
  offlineEvaluation: "http://localhost:5000/offlineEvaluation"
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_CONFIG__: JSON.stringify(appConfig)
  }
});
