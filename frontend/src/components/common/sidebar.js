import React, { useState } from 'react';
import { Layout, Menu, Flex, Typography, Grid, Drawer, Button } from 'antd';
import {
 HomeOutlined,
 FormOutlined,
 GlobalOutlined,
 QuestionCircleOutlined,
 LockOutlined,
 MenuOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../context/TranslationContext';
import { LanguageSelectorSideBar } from '../../utils/LanguageSelectorSideBar';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/Trevio-10.png';
import MobileLogo from '../../assets/MobileLogo.png';

const { Sider } = Layout;
const { useBreakpoint } = Grid;
const { Text } = Typography;

const Sidebar = ({ reservationCode, onCollapse }) => {
 const { t } = useTranslation();
 const navigate = useNavigate();
 const location = useLocation();
 const screens = useBreakpoint();
 const [drawerVisible, setDrawerVisible] = useState(false);
 const [collapsed, setCollapsed] = useState(false);

 // Define menu items
 const menuItems = [
  {
   key: '/',
   icon: <i className="fa-regular fa-house-blank" />,
   label: t('common.home'),
  },
  {
   key: 'language',
   icon: <i className="fa-light fa-globe" />,
   label: <LanguageSelectorSideBar />,
  },
  {
   key: '/faqs',
   icon: <i className="fa-regular fa-square-question" />,
   label: t('common.FAQs'),
  },
  {
   key: '/privacy-policy',
   icon: <i className="fa-regular fa-shield-halved" />,
   label: t('privacyPolicy.title'),
  },
 ];

 const handleMenuClick = (e) => {
  // Skip language item
  if (e.key === 'language' || e.key === 'language-selector') return;

  navigate(e.key);
  if (!screens.md) {
   setDrawerVisible(false);
  }
 };

 // Mobile menu toggle
 const toggleDrawer = () => {
  setDrawerVisible(!drawerVisible);
 };

 const handleCollapse = (isCollapsed) => {
  setCollapsed(isCollapsed);
  if (onCollapse) {
   onCollapse(isCollapsed);
  }
 };

 // Selected key based on location
 const selectedKey = location.pathname;

 // Logo and reservation code
 const LogoSection = () => (
  <div
   style={{
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
   }}
  >
   {collapsed ? (
    <img src={MobileLogo} alt="Logo" width="50" />
   ) : (
    <img
     src={logo}
     alt="Logo"
     style={{
      height: 40,
      marginRight: 10,
     }}
    />
   )}
  </div>
 );
 const TopHeader = () => (
  <Flex
   justify="space-between"
   align="center"
   style={{
    padding: '12px 16px',
    width: '100%',
    backgroundColor: '#F8F7FE',
    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
   }}
  >
   <Button
    type="text"
    icon={<MenuOutlined />}
    onClick={toggleDrawer}
    size="large"
   />

   <img src={MobileLogo} alt="Logo" width="42" />
  </Flex>
 );

 return (
  <>
   {/* Desktop Sidebar */}
   {screens.md && (
    <Sider
     width={280}
     theme="dark"
     collapsible
     collapsed={collapsed}
     onCollapse={handleCollapse}
     style={{
      height: '100vh',
      backgroundColor: '#303342',
      overflow: 'auto',
      position: 'sticky',
      top: 0,
      left: 0,
      zIndex: 100,
     }}
     className="sidebar-desktop"
     trigger={
      <div className="custom-trigger">
       <i
        className={`fa-regular ${
         collapsed ? 'fa-arrow-right-long' : 'fa-arrow-left-long'
        }`}
       />
      </div>
     }
    >
     <LogoSection />
     <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      onClick={handleMenuClick}
      style={{
       borderRight: 0,
       backgroundColor: '#303342',
      }}
      items={menuItems}
     />
    </Sider>
   )}

   {/* Mobile Sidebar (Button + Drawer) */}
   {!screens.md && (
    <>
     <TopHeader />

     <Drawer
      placement="left"
      onClose={toggleDrawer}
      open={drawerVisible}
      width={280}
      style={{ padding: 0, backgroundColor: '#f6f6fa' }}
      className="sidebar-drawer"
     >
      <LogoSection />
      <Menu
       mode="inline"
       selectedKeys={[selectedKey]}
       onClick={handleMenuClick}
       style={{
        borderRight: 0,
        backgroundColor: '#f6f6fa',
       }}
       items={menuItems}
       className="sidebar-menu"
      />
     </Drawer>
    </>
   )}
  </>
 );
};

export default Sidebar;
