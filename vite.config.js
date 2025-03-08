import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const appConfig = {
  scenarios: "http://localhost:5000/scenarios",
  getModels: "http://localhost:5000/getModels",
  saveModel: "http://localhost:5000/saveModel",
  get_algorithm:"http://localhost:5000/get_algorithm",
  train:"http://localhost:5000/train",
  stop_training: "http://localhost:5000/stop_training",
  training_status:"http://localhost:5000/training_status",
  get_effect:"http://localhost:5000/get_effect",
  publish_model:"http://localhost:5000/publish_model",
  get_datasets:"http://localhost:5000/get_datasets",
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_CONFIG__: JSON.stringify(appConfig)
  }
});
