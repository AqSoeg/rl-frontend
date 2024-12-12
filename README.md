## 项目配置

使用 [Vite](https://vitejs.cn/vite3-cn/guide/) 搭建项目：
```bash
npm create vite@latest # frontend -> React-> JavaScript + SWC
cd frontend
npm install
```

## 工具安装

1. 安装路由管理：`npm install react-router-dom`。
2. 安装 [Ant Design](https://ant.design/docs/react/use-with-vite-cn)：`npm install antd --save`。
3. 安装 [json-server](https://www.npmjs.com/package/json-server)：`npm install json-server`，运行 `json-server db.json`。
4. 安装 moment：`npm install`。
5. 安装 mobx 和 mobx-react：`npm install mobx mobx-react`。
6. 安装 axios：`npm install axios`。

## 项目运行

1. 运行后端：`npx json-server --watch db.json --port 3000`。
2. 运行网页：`npm run dev`。

## 如果有新增的内容，先写在后面，便于合并