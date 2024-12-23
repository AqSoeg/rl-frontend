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
4. 安装 moment：`npm install moment`。
5. 安装 mobx 和 mobx-react：`npm install mobx mobx-react`。
6. 安装 axios：`npm install axios`。
7. 安装 [ws](https://github.com/websockets/ws)：`npm install ws`。
8. 安装 MathJax：`npm install better-react-mathjax`。

## 项目运行

1. 运行后端：
   - `npx json-server --watch public/db.json --port 3000`； 
   - `npx json-server --watch public/train.json --port 3001`； 
   - `npx json-server --watch tmp/model.json --port 3002`。 
2. 运行网页：`npm run dev`。
3. 运行 Web-Socket 服务：`node public/server.js`。

## gitignore

注意 tmp 文件夹被 gitignore 了，所以需要自己创建 tmp/model.json 文件
```json
[
  {
    "scenarioID": "traffic",
    "agentRoleID": "traffic_light",
    "agentType": "同构多智能体",
    "agentName": "1",
    "agentVersion": "1",
    "agentID": "ri0trtfia944iic1",
    "agentModelName": "智能体1",
    "entityAssignments": [
      {
        "智能体1": [
          "红绿灯1"
        ]
      },
      {
        "智能体2": [
          "红绿灯2"
        ]
      },
      {
        "智能体3": [
          "红绿灯3"
        ]
      },
      {
        "智能体4": [
          "红绿灯4"
        ]
      }
    ],
    "updateTime": "2024-12-19T11:01:26.319Z"
  }
]
```

## 如果有新增的内容，先写在后面，便于合并