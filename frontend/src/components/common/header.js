import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
 Layout,
 Flex,
 Menu,
 Avatar,
 Typography,
 Button,
 Space,
 Drawer,
 List,
 Divider,
 message,
} from 'antd';
import { useTranslation } from '../../context/TranslationContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useLogout } from '../../hooks/useLogout';
import { useUserData } from '../../hooks/useUserData';
import { LanguageSelector } from '../../utils/LanguageSelector';
import NotificationBell from './NotificationBell';
import TutorialsButton from './TutorialsButton';
import TutorialsAlert from './TutorialsAlert';
import Logo from '../../assets/Trevio-11.png';
import MobileLogo from '../../assets/MobileLogo.png';
import { Helmet } from 'react-helmet';
import MobileNavigationBar from './MobileNavigationBar';

const { Header } = Layout;

const Head = ({ onUserData = () => {} }) => {
 const { t } = useTranslation();
 const location = useLocation();
 const navigate = useNavigate();
 const { logout } = useLogout();
 const { user } = useAuthContext();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { userData, getUserData, isLoading } = useUserData();
 const [open, setOpen] = useState(false);
 const [tutorialsOpen, setTutorialsOpen] = useState(false);
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
   label: t('reservation.title'),
   path: '/reservations',
   pathPatterns: [
    '/reservations',
    '/create-reservation',
    '/generate-contract',
    '/contractslist',
   ],
  },
  {
   key: 'properties',
   label: t('property.title'),
   path: '/propertiesdashboard',
   pathPatterns: [
    '/propertiesdashboard',
    '/addproperty',
    '/property-management',
    '/digitalguidebook',
    '/createnearbyplace',
   ],
  },
  {
   key: 'tasks',
   label: t('tasks.title'),
   path: '/tasksdashboard',
  },
  {
   key: 'revenue',
   label: t('revenue.title'),
   path: '/revenues',
   pathPatterns: ['/revenues', '/propertyrevenuedashboard'],
  },
  // Add admin panel to main menu items - only shown if user is an admin
  ...(userData && userData.role === 'admin'
   ? [
      {
       key: 'adminpanel',
       label: t('header.adminPanel'),
       path: '/adminpanel',
       pathPatterns: [
        '/adminpanel',
        '/clients',
        '/properties',
        '/nearbyplaces',
        '/pendingproperties',
        '/pendingnearbyplaces',
       ],
      },
     ]
   : []),
 ];

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

 const showTutorialsDrawer = () => setTutorialsOpen(true);
 const onTutorialsClose = () => setTutorialsOpen(false);

 const handleReferFriend = async (t) => {
  const referralLink = `${window.location.origin}/signup?referralCode=${userData.id}`;
  navigator.clipboard.writeText(referralLink);
  message.success(t('messages.refereFriend'));
 };

 // User menu items for dropdown and drawer
 const getMenuItems = () => {
  const items = [
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
  ];
  items.push(
   ...(userData && userData.role === 'admin' && isMobile
    ? [
       {
        type: 'divider',
       },
       {
        key: 'adminpanel',
        label: <Text strong>{t('header.adminPanel')}</Text>,
        icon: (
         <i className="PrimaryColor HeaderIcon fa-light fa-chart-simple" />
        ),
        onClick: () => {
         onClick();
         navigate('/adminpanel');
        },
       },
      ]
    : []),
   {
    type: 'divider',
   },
   {
    key: 'referral',
    label: <Text strong>{t('header.referral')}</Text>,
    icon: <i className="PrimaryColor HeaderIcon fa-light fa-user-plus" />,
    onClick: () => {
     handleReferFriend(t);
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
   }
  );

  return items;
 };

 const handleLogOut = () => {
  logout();
  navigate('/login');
 };
 const handleLogin = () => {
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

 const getInitialSelectedKey = () => {
  const currentPath = location.pathname;

  const matchingItem = menuItems.find((item) => {
   if (item.pathPatterns && Array.isArray(item.pathPatterns)) {
    return item.pathPatterns.some((pattern) => currentPath.includes(pattern));
   }
   return currentPath.includes(item.path);
  });

  if (matchingItem) {
   return matchingItem.key;
  } else if (currentPath === '/') {
   return 'reservations';
  } else {
   return '';
  }
 };

 const [selectedKey, setSelectedKey] = useState(getInitialSelectedKey());

 useEffect(() => {
  const currentPath = location.pathname;

  // Find matching menu item based on pathPatterns
  const matchingItem = menuItems.find((item) => {
   // Make sure pathPatterns exists before calling .some()
   if (item.pathPatterns && Array.isArray(item.pathPatterns)) {
    return item.pathPatterns.some((pattern) => currentPath.includes(pattern));
   }
   // Fallback to simple path matching if pathPatterns is not defined
   return currentPath.includes(item.path);
  });

  if (matchingItem) {
   setSelectedKey(matchingItem.key);
  } else if (currentPath === '/') {
   setSelectedKey('reservations');
  } else {
   // If path doesn't match any menu item, set selectedKey to null or empty string
   setSelectedKey('');
  }
 }, [location.pathname, menuItems]);

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
    {/* Mobile top navigation section */}
    {isMobile ? (
     <Flex className="mobile-top-nav">
      {/* Left side - Menu button with avatar */}
      <div className="mobile-menu-avatar">
       <Button
        type="text"
        className="mobile-avatar-button"
        onClick={showDrawer}
       >
        <Space>
         <i className="fa-solid fa-bars" />
         <Avatar size={38} src={userData?.avatar} />
        </Space>
       </Button>
      </div>

      {/* Center - Logo */}
      <div className="mobile-logo-container">
       <Link to="/reservations">
        <img src={MobileLogo} alt="Trevio Logo" className="mobile-logo" />
       </Link>
      </div>

      {/* Right side - Language and Notifications */}
      <div className="mobile-actions">
       <TutorialsButton onClick={showTutorialsDrawer} />
       <LanguageSelector />
       <NotificationBell userId={userData?.id} />
      </div>
     </Flex>
    ) : (
     <>
      {/* Desktop header */}
      <div className="logo-container">
       <Link to="/reservations">
        <img src={Logo} alt="Trevio Logo" className="logo" />
       </Link>
      </div>

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

      <div className="right-section">
       <TutorialsButton onClick={showTutorialsDrawer} />
       <LanguageSelector />
       <NotificationBell userId={userData?.id} />
       <div className="avatar-container">
        <Button
         type="text"
         icon={
          <i className="fa-light fa-bars fa-lg" style={{ color: '#fff' }} />
         }
         className="HeaderAvatar"
         size="large"
         onClick={showDrawer}
        >
         <Avatar
          size={{ xs: 40, sm: 44, md: 44, lg: 44, xl: 44, xxl: 44 }}
          src={userData?.avatar}
         />
        </Button>
       </div>
      </div>
     </>
    )}
   </Header>

   {/* Mobile Navigation Bar - Only show on mobile */}
   {isMobile && <MobileNavigationBar />}

   {/* Tutorials Drawer */}
   <TutorialsAlert open={tutorialsOpen} onClose={onTutorialsClose} />

   {/* Avatar Drawer */}
   <Drawer
    title={null}
    onClose={onClose}
    open={open}
    placement={isMobile ? 'left' : 'right'}
    width={isMobile ? '90%' : 378}
   >
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
    <Divider style={{ margin: 0 }} />
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

export default Head;
