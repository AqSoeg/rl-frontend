import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const appConfig = {
  scenarios: "http://localhost:5000/scenarios",
  getModels: "http://localhost:5000/getModels",
  saveModel: "http://localhost:5000/saveModel"
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_CONFIG__: JSON.stringify(appConfig)
  }
});
