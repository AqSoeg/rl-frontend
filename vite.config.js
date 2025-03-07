import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// 定义全局配置
const appConfig = {
  scenarios: "http://localhost:5000/scenarios",
  getModels: "http://localhost:5000/getModels",
  saveModel: "http://localhost:5000/saveModel"
};

export default defineConfig({
  plugins: [react()],
  define: {
    // 将配置对象注入到全局环境中
    __APP_CONFIG__: JSON.stringify(appConfig)
  }
});
