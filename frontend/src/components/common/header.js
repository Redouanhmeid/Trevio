import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useTranslation } from '../../context/TranslationContext';
import {
 Spin,
 Drawer,
 Typography,
 Divider,
 Layout,
 Avatar,
 Col,
 Row,
 Image,
 List,
 Menu,
 Button,
 Space,
 message,
} from 'antd';
import Logo from '../../assets/Trevio-10.png';
import MobileLogo from '../../assets/MobileLogo.png';
import { Helmet } from 'react-helmet';
import { useUserData } from '../../hooks/useUserData';
import { LanguageSelector } from '../../utils/LanguageSelector';
import NotificationBell from './NotificationBell';

const { Header } = Layout;
const { Text } = Typography;

function getItem(label, key, icon, children, type) {
 return {
  key,
  icon,
  children,
  label,
  type,
 };
}

/* const onSearch = (value, _e, info) => console.log(info?.source, value); */
const Head = ({ onUserData = () => {} }) => {
 const { logout } = useLogout();
 const { user } = useAuthContext();
 const User = user || JSON.parse(localStorage.getItem('user'));
 const { userData = {}, getUserData, isLoading } = useUserData();
 const { t, currentLanguage, setLanguage } = useTranslation();
 const navigate = useNavigate();

 const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);

 useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 576);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
 }, []);

 const handleLogOut = () => {
  logout();
  navigate('/login');
 };
 const handleLogin = () => {
  navigate('/login');
 };
 const handleSignUp = () => {
  logout();
  navigate('/signup');
 };
 const handleReferFriend = async (t) => {
  const referralLink = `${window.location.origin}/signup?referralCode=${userData.id}`;
  navigator.clipboard.writeText(referralLink);
  message.success(t('messages.refereFriend'));
 };

 const menuItems = [
  // Account - shown to all users
  getItem(
   <Link to="/account">
    <Text strong>{t('header.account')}</Text>
   </Link>,
   '0',
   <i className="PrimaryColor HeaderIcon fa-light fa-user" />
  ),
  // Admin Panel - only shown to admins
  userData?.role === 'admin' &&
   getItem(
    <Link to="/adminpanel">
     <Text strong>{t('header.adminPanel')}</Text>
    </Link>,
    '1',
    <i className="PrimaryColor HeaderIcon fa-light fa-gear"></i>
   ),
  // Dashboard - different routes for managers and clients
  userData?.role === 'manager'
   ? getItem(
      <Link to="/manager/dashboard">
       <Text strong>{t('header.dashboard')}</Text>
      </Link>,
      '2',
      <i className="PrimaryColor HeaderIcon fa-light fa-bolt"></i>
     )
   : getItem(
      <Link to="/dashboard">
       <Text strong>{t('header.dashboard')}</Text>
      </Link>,
      '2',
      <i className="PrimaryColor HeaderIcon fa-light fa-bolt"></i>
     ),
  {
   type: 'divider',
  },

  getItem(
   <Link to="/revtaskdashboard">
    <Text strong>{t('header.Revandtasks')}</Text>
   </Link>,
   '3',
   <i className="PrimaryColor HeaderIcon fa-light fa-chart-line"></i>
  ),
  // Referral - only shown to clients
  userData?.role !== 'manager' &&
   getItem(
    <span onClick={() => handleReferFriend(t)}>
     <Text strong>{t('header.referral')}</Text>
    </span>,
    '4',
    <i className="PrimaryColor HeaderIcon fa-light fa-user-plus"></i>
   ),
  {
   type: 'divider',
  },
  // Logout - shown to all users
  getItem(
   <Link onClick={handleLogOut}>
    <Text strong>{t('header.logout')}</Text>
   </Link>,
   '5',
   <i className="PrimaryColor HeaderIcon fa-light fa-right-from-bracket"></i>
  ),
 ].filter(Boolean);

 const [open, setOpen] = useState(false);
 const showDrawer = () => {
  setOpen(true);
 };
 const onClose = () => {
  setOpen(false);
 };
 const onClick = () => {
  onClose();
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
 }, [User?.email, User?.status, userData]);

 useEffect(() => {
  fetchUserData();
 }, [fetchUserData]);

 useEffect(() => {
  if (userData && userData.id) {
   onUserData(userData.id);
  }
 }, [userData, onUserData]);

 return (
  <>
   <Helmet>
    <link
     rel="stylesheet"
     href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
    />
   </Helmet>
   <Header className="headerStyle">
    <Row>
     <Col
      xs={{ span: 12, order: 2 }}
      sm={{ span: 6, order: 1 }}
      md={{ span: 3, order: 1 }}
     >
      <Link to={'/'} className="logo-container">
       <Image
        className="logoStyle"
        src={isMobile ? MobileLogo : Logo}
        preview={false}
       />
      </Link>
     </Col>

     {userData && Object.keys(userData).length > 0 ? (
      <>
       <Col
        xs={{ span: 6, order: 3 }}
        sm={{ span: 8, offset: 4, order: 2 }}
        md={{ span: 2, offset: 16, order: 2 }}
       >
        <Space className="header-actions" wrap size="large">
         <LanguageSelector />
         <NotificationBell userId={userData.id} />
        </Space>
       </Col>

       <Col
        xs={{ span: 6, order: 1 }}
        sm={{ span: 6, order: 3 }}
        md={{ span: 3, order: 3 }}
       >
        <div className="avatar-container">
         <Spin spinning={isLoading}>
          <Button
           type="text"
           icon={
            <i
             className="fa-light fa-bars fa-lg"
             style={{ color: '#6D5FFA' }}
            />
           }
           className="HeaderAvatar"
           size="large"
           onClick={showDrawer}
          >
           <Avatar
            size={{ xs: 40, sm: 44, md: 44, lg: 44, xl: 44, xxl: 44 }}
            src={userData.avatar}
           />
          </Button>
         </Spin>
        </div>
       </Col>
      </>
     ) : (
      <>
       <Col
        xs={{ span: 2, order: 3 }}
        sm={{ span: 8, offset: 4, order: 2 }}
        md={{ span: 2, offset: 16, order: 2 }}
       >
        <LanguageSelector />
       </Col>
       <Col
        xs={{ span: 8, order: 1 }}
        sm={{ span: 6, order: 3 }}
        md={{ span: 3, order: 3 }}
       >
        <Space>
         <Button
          onClick={handleLogin}
          type="primary"
          icon={<i className="fa-light fa-user"></i>}
          shape="circle"
         />
         <Button onClick={handleSignUp}>{t('header.createAccount')}</Button>
        </Space>
       </Col>
      </>
     )}
    </Row>

    <Drawer title={null} onClose={onClose} open={open}>
     <List
      dataSource={[{ id: 1, name: 'Redouan' }]}
      bordered={false}
      renderItem={(item) => (
       <List.Item key={item.id}>
        <List.Item.Meta
         avatar={
          <Avatar
           size={{ xs: 40, sm: 46, md: 46, lg: 46, xl: 50, xxl: 50 }}
           src={userData.avatar}
          />
         }
         title={t('header.greeting')}
         description={userData.email}
        />
       </List.Item>
      )}
     />
     <Divider />
     <Menu
      onClick={onClick}
      mode="vertical"
      selectable={false}
      items={menuItems}
     />
    </Drawer>
   </Header>
  </>
 );
};

export default React.memo(Head);
