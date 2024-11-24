import { Layout, ConfigProvider, theme, Button } from 'antd'
import Sidebar from './components/Sidebar'
import StateVector from './components/StateVector'
import ActionSpace from './components/ActionSpace'
import RewardFunction from './components/RewardFunction'

const { Header, Content, Sider, Footer } = Layout

const App = () => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            siderBg: '#ffffff',
            headerBg: '#0958d9',
          },
        },
        algorithm: [theme.defaultAlgorithm],
      }}
    >
      <Layout className='min-h-screen'>
        {/* 顶部 Header */}
        <Header className='bg-blue-800 text-white flex items-center px-6'>
          <h1 className='h-full' style={{ color: 'white' }}>
            智能体建模软件 v1.0
          </h1>
        </Header>

        <Layout>
          {/* 左侧边栏 */}
          <Sider width={300} className='bg-white shadow-md'>
            <Sidebar />
          </Sider>

          {/* 主内容 */}
          <Content className='bg-gray-100 p-6'>
            <div className='grid grid-cols-3 gap-6'>
              <StateVector />
              <ActionSpace />
              <RewardFunction />
            </div>
          </Content>
        </Layout>
        <Footer>
          <Button type='primary'>载入模型</Button>
          <Button type='primary'>保存模型</Button>
        </Footer>
      </Layout>
    </ConfigProvider>
  )
}

export default App
