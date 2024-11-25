// 导入所需的 React 钩子和 React Router 组件
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom';
// 导入图片资源
import reactLogo from './assets/react.svg';
import SettingsLogo from './assets/settings.svg';
// 导入组件
import AgentEditor from './components/AgentEditor/AgentEditor.jsx';

// 定义 App 组件
function App() {
  // 使用 useState 钩子初始化活动标签状态
  const [activeTab, setActiveTab] = useState(''); // 默认设置为空

  // 定义标签数组，包含每个标签的名称和路径
  const tabs = [
    { name: '智能体编辑', path: '/智能体编辑' },
    { name: '训练服务', path: '/训练服务' },
    { name: '评估与优化', path: '/评估与优化' },
    { name: '模型管理', path: '/模型管理' },
  ];

  // 返回 JSX 结构
  return (
      <Router>
        {/* 使用 Flexbox 布局创建一个全屏的容器 */}
        <div className="flex flex-col h-screen">
          {/* 定义头部区域，包含 Logo 和设置按钮 */}
          <header className="bg-[#0056b3] text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              {/* HomeLink 组件，用于导航到首页 */}
              <HomeLink />
            </div>
            <div className="flex items-center">
              {/* 设置文字 */}
              <span className="mr-2">设置</span>
              {/* 设置按钮，包含设置图标 */}
              <button className="text-white text-lg font-bold flex items-center">
                <img src={SettingsLogo} alt="Settings" className="h-8 filter invert"/>
              </button>
            </div>
          </header>
          {/* 定义导航栏区域 */}
          <nav className="bg-[#f8f9fa] py-2.5 border-b border-gray-300">
            <div className="container mx-auto">
              {/* 使用 Flexbox 布局创建一个平均分布的导航项容器 */}
              <div className="flex justify-between">
                {/* 遍历 tabs 数组，为每个标签创建一个 NavLink 组件 */}
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.name}
                        to={tab.path}
                        className={({ isActive }) => `no-underline px-5 py-2.5 rounded-md transition duration-300 ease-in-out ${isActive ? 'bg-[#007bff] text-white' : 'hover:bg-[#007bff] hover:text-white'}`}
                        onClick={() => setActiveTab(tab.name)}
                    >
                      {tab.name}
                    </NavLink>
                ))}
              </div>
            </div>
          </nav>
          {/* 定义路由区域 */}
          <Routes>
            {/* 为每个路径定义对应的组件 */}
            <Route path="/智能体编辑" element={<AgentEditor />} />
            <Route path="/训练服务" element={<TrainingService />} />
            <Route path="/评估与优化" element={<EvaluationOptimization />} />
            <Route path="/模型管理" element={<ModelManagement />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
  );
}

// 定义 HomeLink 组件，用于导航到首页
function HomeLink() {
  const navigate = useNavigate(); // 使用 useNavigate 钩子

  const handleClick = () => {
    navigate('/'); // 点击时导航到首页
  };

  return (
      // 创建一个可点击的容器，包含 Logo 和文本
      <div onClick={handleClick} className="cursor-pointer flex items-center">
        <img src={reactLogo} alt="Logo" className="h-10 mr-2.5 filter brightness-0 invert" />
        <div className="flex items-baseline">
          <h1 className="text-3xl font-bold">智能体建模软件</h1>
          <h1 className="text-xl font-bold ml-2">v1.0</h1>
        </div>
      </div>
  );
}

// 定义 HomePage 组件，用于渲染首页内容
function HomePage() {
  return <div>首页</div>;
}

// 定义 TrainingService 组件，用于渲染训练服务页面内容
function TrainingService() {
  return <div>训练服务页面</div>;
}

// 定义 EvaluationOptimization 组件，用于渲染评估与优化页面内容
function EvaluationOptimization() {
  return <div>评估与优化页面</div>;
}

// 定义 ModelManagement 组件，用于渲染模型管理页面内容
function ModelManagement() {
  return <div>模型管理页面</div>;
}

export default App; // 导出 App 组件