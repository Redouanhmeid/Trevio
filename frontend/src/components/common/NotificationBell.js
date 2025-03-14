import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, Typography, Space, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import useNotification from '../../hooks/useNotification';
import { useTranslation } from '../../context/TranslationContext';

const { Text } = Typography;

const NotificationBell = ({ userId }) => {
 const { t } = useTranslation();
 const [notifications, setNotifications] = useState([]);
 const [unreadCount, setUnreadCount] = useState(0);
 const { getUserNotifications, markAsRead, getUnreadCount } = useNotification();
 const navigate = useNavigate();

 const fetchNotifications = async () => {
  const data = await getUserNotifications(userId);
  if (data) {
   setNotifications(data);
  }
 };

 const updateUnreadCount = async () => {
  const count = await getUnreadCount(userId);
  setUnreadCount(count);
 };

 useEffect(() => {
  if (userId) {
   fetchNotifications();
   updateUnreadCount();
   // Poll for new notifications every minute
   const interval = setInterval(() => {
    fetchNotifications();
    updateUnreadCount();
   }, 60000);
   return () => clearInterval(interval);
  }
 }, [userId]);

 const handleMarkAsRead = async (notificationId) => {
  await markAsRead(notificationId);
  fetchNotifications();
  updateUnreadCount();
 };

 const getNotificationTime = (createdAt) => {
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

  if (diffInMinutes < 60) {
   return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
   return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
   return notificationDate.toLocaleDateString();
  }
 };

 const handleNotificationClick = async (notification) => {
  // First mark as read if not already read
  if (!notification.read) {
   await markAsRead(notification.id);
   fetchNotifications();
   updateUnreadCount();
  }

  // Then navigate based on notification type
  switch (notification.type) {
   case 'revenue_update':
   case 'task_update':
    navigate('/revtaskdashboard');
    break;
   case 'property_update':
    navigate('/dashboard');
    break;
   default:
    break;
  }
 };

 const getTypeIcon = (type) => {
  switch (type) {
   case 'revenue_update':
    return '💰';
   case 'task_update':
    return '📋';
   case 'property_update':
    return '🏠';
   default:
    return '📌';
  }
 };

 // Create menu items for the dropdown
 const dropdownRender = (menu) => (
  <div className="NotificationRender">{menu}</div>
 );

 const menuItems = {
  items:
   notifications.length > 0
    ? notifications.map((item, index) => ({
       key: item.id || index,
       label: (
        <div
         style={{
          backgroundColor: item.read ? '#fdfdfd' : '#e8e7f9',
          padding: '2%',
          width: '96%',
         }}
        >
         <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>{getTypeIcon(item.type)}</span>
          <div style={{ flex: 1 }}>
           <Text strong style={{ fontSize: '14px' }}>
            {item.title}
           </Text>
           <div style={{ margin: '4px 0', fontSize: '13px' }}>
            {item.message}
           </div>
           <Text type="secondary" style={{ fontSize: '12px' }}>
            {getNotificationTime(item.createdAt)}
           </Text>
          </div>
         </div>
        </div>
       ),
       onClick: () => handleNotificationClick(item),
       style: { padding: 0 },
      }))
    : [
       {
        key: 'empty',
        label: (
         <Empty
          description={t('notification.noNotification')}
          style={{ padding: '20px', width: '350px' }}
         />
        ),
       },
      ],
  style: { maxHeight: '500px', overflow: 'auto' },
 };

 return (
  <Dropdown
   menu={menuItems}
   trigger={['click']}
   placement="bottomRight"
   dropdownRender={dropdownRender}
  >
   <Space style={{ cursor: 'pointer', padding: '1px 4px' }}>
    <Badge count={unreadCount} size="small" overflowCount={9} offset={[10, -3]}>
     <i className="PrimaryColor fa-light fa-bell fa-2xl" />
    </Badge>
   </Space>
  </Dropdown>
 );
};

export default NotificationBell;
