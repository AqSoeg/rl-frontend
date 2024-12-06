import React, { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import AlgorithmLibrary from './algorithmlibrary';
import ModelLibrary from './modellibrary';
import OfflineDatabase from './offlinedatabase';
import BehaviorLibrary from './behaviorlibrary';

const { Header, Footer, Sider, Content } = Layout;

const ModelManagement = () => {
  const [current, setCurrent] = useState('智能体模型库');

  const handleMenuClick = e => {
    setCurrent(e.key);
  };

  const renderContent = () => {
    switch (current) {
      case '智能体模型库':
        return <ModelLibrary />;
      case '行为规则库':
        return <BehaviorLibrary />;
      case '算法模型库':
        return <AlgorithmLibrary />;
      case '离线数据库':
        return <OfflineDatabase />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" />
        <Menu defaultSelectedKeys={['智能体模型库']} mode="inline" onClick={handleMenuClick} >
          <Menu.Item key="智能体模型库">智能体模型库</Menu.Item>
          <Menu.Item key="行为规则库">行为规则库</Menu.Item>
          <Menu.Item key="算法模型库">算法模型库</Menu.Item>
          <Menu.Item key="离线数据库">离线数据库</Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©2018 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default ModelManagement;