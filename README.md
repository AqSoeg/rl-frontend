# 项目配置

使用 [Vite](https://vitejs.cn/vite3-cn/guide/) 搭建项目：
```bash
npm create vite@latest
cd test
npm install
```

安装路由管理和弹窗：
```bash
npm install react-router-dom
npm install react-modal
```

安装 [Ant Design](https://ant.design/docs/react/use-with-vite-cn)：
```bash
npm install antd --save
```

运行网页：
```bash
npm run dev
```

# 项目结构（code 模式下查看）

rl-frontend/  
├── node_modules/ # 项目的各种依赖  
├── public/ # 静态资源文件，在构建时会被复制到输出目录  
├── src/ # 源代码  
│       └── assets/ # 存放项目的静态资源，如图片、字体、图标等  
│       │         ├── react.svg # react Logo  
│       │         └── settings.svg # 设置 Logo  
│       ├── components/ # 组织项目中的 React 组件，每个组件通常包含自己的逻辑、样式和模板  
│       │         ├── AgentEditor # 智能体编辑界面  
│       │                       ├── ActionSpace.jsx # 动作空间  
│       │                       ├── AgentEditor.jsx # 智能体编辑  
│       │                       ├── ModelButton.jsx # 模型按钮  
│       │                       ├── RewardFunction.jsx # 奖励函数  
│       │                       ├── Sidebar.jsx # 侧边栏：智能体设置  
│       │                       └── StateVector.jsx # 状态向量  
│       │         └── TrainingService # 训练服务界面  
│       ├── App.css # 全局样式表文件，用于定义项目中通用的样式规则   
│       ├── App.jsx # 项目的主组件文件，通常作为应用的根组件   
│       └── main.jsx # 应用的入口文件，通常用于渲染根组件（如 App.jsx）到页面上  
├── .gitignore # Git 忽略文件配置，用于指定哪些文件或目录不应该被 Git 版本控制  
├── eslint.config.js # ESLint 配置文件，用于定义 JavaScript 代码的检查规则和风格指南  
├── index.html # 应用的入口 HTML 文件，通常用于定义页面的基本结构和挂载点  
├── package.json # 项目的配置文件，包含了项目的元数据、依赖项、脚本等信息  
├── package-lock.json # 由 npm 生成的文件，用于锁定项目依赖的确切版本，确保项目在不同环境下的一致性  
├── README.md # 项目的说明文件  
└── vite.config.js # Vite 的配置文件，用于定义构建、开发服务器、插件等配置选项  
