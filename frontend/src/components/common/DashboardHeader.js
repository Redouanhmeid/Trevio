import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
 Layout,
 Menu,
 Avatar,
 Dropdown,
 Typography,
 Button,
 Flex,
 Space,
 Drawer,
 List,
 Divider,
 Spin,
} from 'antd';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useUserData } from '../../hooks/useUserData';
import { LanguageSelector } from '../../utils/LanguageSelector';
import NotificationBell from './NotificationBell';
import Logo from '../../assets/Trevio-11.png';
import MobileLogo from '../../assets/MobileLogo.png';
import { Helmet } from 'react-helmet';

const { Header } = Layout;

const DashboardHeader = ({ onUserData = () => {} }) => {
 const { t } = useTranslation();
 const location = useLocation();
 const navigate = useNavigate();
 const { logout } = useAuthContext();
 const { user } = useAuthContext();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserData, isLoading } = useUserData();
 const [selectedKey, setSelectedKey] = useState('dashboard');
 const [open, setOpen] = useState(false);
 const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

 // Handle window resize for mobile detection
 useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 576);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 // Define menu items with their corresponding routes
 const menuItems = [
  {
   key: 'reservations',
   label: t('Réservations'),
   path: '/reservations',
  },
  {
   key: 'tasks',
   label: t('Tâche à faire'),
   path: '/propertytaskdashboard',
  },
  {
   key: 'revenue',
   label: t('Revenue'),
   path: '/propertyrevenuedashboard',
  },
  {
   key: 'properties',
   label: t('Propriétés'),
   path: '/properties',
  },
  {
   key: 'concierges',
   label: t('Concierges'),
   path: '/concierges',
  },
 ];

 // Update selected key based on current path
 useEffect(() => {
  const pathSegments = location.pathname.split('/');
  const currentPath = pathSegments[1] || 'reservations';

  // Find matching menu item
  const matchingItem = menuItems.find(
   (item) =>
    item.path.includes(currentPath) ||
    (currentPath === '' && item.key === 'reservations')
  );

  if (matchingItem) {
   setSelectedKey(matchingItem.key);
  }
 }, [location.pathname]);

 // Drawer functions
 const showDrawer = () => {
  setOpen(true);
 };

 const onClose = () => {
  setOpen(false);
 };

 const onClick = () => {
  onClose();
 };

 // User menu items for dropdown and drawer
 const getMenuItems = () => [
  {
   key: 'account',
   label: (
    <Link to="/account">
     <Text strong>{t('header.account')}</Text>
    </Link>
   ),
   icon: <i className="PrimaryColor HeaderIcon fa-light fa-user" />,
   onClick: () => {
    onClick();
    navigate('/account');
   },
  },
  // Dashboard - different routes for managers and clients
  userData?.role === 'manager'
   ? {
      key: 'manager-dashboard',
      label: (
       <Link to="/manager/dashboard">
        <Text strong>{t('header.dashboard')}</Text>
       </Link>
      ),
      icon: <i className="PrimaryColor HeaderIcon fa-light fa-bolt"></i>,
      onClick: () => {
       onClick();
       navigate('/manager/dashboard');
      },
     }
   : {
      key: 'dashboard',
      label: (
       <Link to="/dashboard">
        <Text strong>{t('header.dashboard')}</Text>
       </Link>
      ),
      icon: <i className="PrimaryColor HeaderIcon fa-light fa-bolt"></i>,
      onClick: () => {
       onClick();
       navigate('/dashboard');
      },
     },
  {
   type: 'divider',
  },
  {
   key: 'rev-task-dashboard',
   label: (
    <Link to="/revtaskdashboard">
     <Text strong>{t('header.Revandtasks')}</Text>
    </Link>
   ),
   icon: <i className="PrimaryColor HeaderIcon fa-light fa-chart-line"></i>,
   onClick: () => {
    onClick();
    navigate('/revtaskdashboard');
   },
  },
  {
   type: 'divider',
  },
  {
   key: 'logout',
   label: (
    <Link onClick={handleLogOut}>
     <Text strong>{t('header.logout')}</Text>
    </Link>
   ),
   icon: (
    <i className="PrimaryColor HeaderIcon fa-light fa-right-from-bracket"></i>
   ),
   onClick: handleLogOut,
  },
 ];

 const handleLogOut = () => {
  logout();
  navigate('/login');
 };

 // Memoize the getUserData call
 const fetchUserData = useCallback(() => {
  if (
   User?.email &&
   User?.status !== 'EN ATTENTE' &&
   (!userData || Object.keys(userData).length === 0)
  ) {
   getUserData(User.email);
  }
 }, [User?.email, User?.status, userData, getUserData]);

 useEffect(() => {
  fetchUserData();
 }, [fetchUserData]);

 useEffect(() => {
  if (userData && userData.id) {
   onUserData(userData.id);
  }
 }, [userData, onUserData]);

 // Import Typography for drawer items
 const { Text } = Typography;

 return (
  <>
   <Helmet>
    <link
     rel="stylesheet"
     href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
    />
   </Helmet>

   <Header className="dashboard-header">
    {/* Logo */}
    <div className="logo-container">
     <Link to="/dashboard">
      <img
       src={isMobile ? MobileLogo : Logo}
       alt="Trevio Logo"
       className="logo"
      />
     </Link>
    </div>

    {/* Navigation Menu - Only show on non-mobile */}
    {!isMobile && (
     <Menu
      mode="horizontal"
      selectedKeys={[selectedKey]}
      className="nav-menu"
      items={menuItems.map((item) => ({
       key: item.key,
       label: (
        <Link to={item.path}>
         <Space>
          {item.icon}
          <span>{item.label}</span>
         </Space>
        </Link>
       ),
      }))}
     />
    )}

    {/* Right side elements */}
    <div className="right-section">
     <LanguageSelector />
     <NotificationBell userId={userData?.id} />

     {/* Mobile burger menu */}
     <div className="avatar-container">
      <Button
       type="text"
       icon={<i className="fa-light fa-bars fa-lg" style={{ color: '#fff' }} />}
       className="HeaderAvatar"
       size="large"
       onClick={showDrawer}
      >
       <Avatar
        size={{ xs: 40, sm: 44, md: 44, lg: 44, xl: 44, xxl: 44 }}
        src={userData.avatar}
       />
      </Button>
     </div>
    </div>
   </Header>

   {/* Mobile Drawer */}
   <Drawer title={null} onClose={onClose} open={open}>
    <List
     dataSource={[{ id: 1, name: userData?.firstname || 'User' }]}
     bordered={false}
     renderItem={(item) => (
      <List.Item key={item.id}>
       <List.Item.Meta
        avatar={
         <Avatar
          size={{ xs: 40, sm: 46, md: 46, lg: 46, xl: 50, xxl: 50 }}
          src={userData?.avatar}
         />
        }
        title={t('header.greeting')}
        description={userData?.email}
       />
      </List.Item>
     )}
    />
    <Divider />
    <Menu
     onClick={onClick}
     mode="vertical"
     selectable={false}
     items={getMenuItems()}
    />
   </Drawer>
  </>
 );
};

export default DashboardHeader;
