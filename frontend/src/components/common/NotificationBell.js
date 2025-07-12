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
    navigate('/revenues');
    break;
   case 'task_update':
    navigate('/propertytaskdashboard');
    break;
   case 'property_update':
    navigate('/propertiesdashboard');
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

 // Function to translate notification content
 const translateNotification = (notification) => {
  // Check if the notification has translation keys stored (future notifications)
  if (notification.titleKey && notification.messageKey) {
   const params = notification.messageParams || {};

   switch (notification.type) {
    case 'property_update':
     return {
      title: t(notification.titleKey),
      message: `${t('notification.messages.propertyVerified.part1')} '${
       params.propertyName || ''
      }' ${t('notification.messages.propertyVerified.part2')}`,
     };

    case 'revenue_update':
     return {
      title: t(notification.titleKey),
      message: `${t('notification.messages.revenueAdded.part1')} ${
       params.amount || ''
      } ${t('notification.messages.revenueAdded.part2')} ${
       params.month || ''
      }/${params.year || ''}`,
     };

    case 'task_update':
     return {
      title: t(notification.titleKey),
      message: `${t('notification.messages.taskCreated.part1')} '${
       params.taskTitle || ''
      }' ${t('notification.messages.taskCreated.part2')} ${
       params.priority || ''
      } ${t('notification.messages.taskCreated.part3')}`,
     };

    default:
     return {
      title: t(notification.titleKey),
      message: t(notification.messageKey),
     };
   }
  }

  // Handle existing notifications by extracting values from the message text
  switch (notification.type) {
   case 'property_update':
    if (
     notification.title.includes('verified') ||
     notification.message.includes('verified') ||
     notification.title.includes('vérifiée') ||
     notification.message.includes('vérifiée')
    ) {
     const propertyName = notification.property?.name || '';
     return {
      title: t('notification.messages.createTitle'),
      message: `${t(
       'notification.messages.propertyVerified.part1'
      )} '${propertyName}' ${t(
       'notification.messages.propertyVerified.part2'
      )}`,
     };
    } else {
     return {
      title: t('notification.messages.propertyUpdateTitle'),
      message: t('notification.messages.propertyUpdateMessage'),
     };
    }

   case 'revenue_update':
    // Extract amount from message like "Revenue of 1500 DHS" or "Un revenu de 1500 DHS"
    const amountMatch = notification.message.match(/(\d+(?:[.,]\d+)?)/);
    // Extract date from message like "for 06/2025" or "pour 06/2025"
    const dateMatch = notification.message.match(/(\d{1,2}\/\d{4})/);

    // If no amount/date found in message, show a generic message
    if (!amountMatch && !dateMatch) {
     return {
      title: t('notification.messages.revenueTitle'),
      message: t('notification.messages.revenueGeneric'),
     };
    }

    const amount = amountMatch ? amountMatch[1] : '';
    const date = dateMatch ? dateMatch[1] : '';

    return {
     title: t('notification.messages.revenueTitle'),
     message: `${t('notification.messages.revenueAdded.part1')} ${amount} ${t(
      'notification.messages.revenueAdded.part2'
     )} ${date}`,
    };

   case 'task_update':
    // Extract task title from single quotes like 'task name'
    const taskMatch = notification.message.match(/'([^']+)'/);
    // Extract priority from "priorité medium" or "priority high"
    const priorityMatch = notification.message.match(/priorité?\s+(\w+)/i);
    const taskTitle = taskMatch ? taskMatch[1] : '';
    const priority = priorityMatch ? priorityMatch[1] : '';

    return {
     title: t('notification.messages.taskTitle'),
     message: `${t(
      'notification.messages.taskCreated.part1'
     )} '${taskTitle}' ${t(
      'notification.messages.taskCreated.part2'
     )} ${priority} ${t('notification.messages.taskCreated.part3')}`,
    };

   default:
    return {
     title: notification.title,
     message: notification.message,
    };
  }
 };

 // Create menu items for the dropdown
 const dropdownRender = (menu) => (
  <div className="NotificationRender">{menu}</div>
 );

 const menuItems = {
  items:
   notifications.length > 0
    ? notifications.map((item, index) => {
       const translatedContent = translateNotification(item);

       return {
        key: item.id || index,
        label: (
         <div
          style={{
           backgroundColor: item.read ? '#fdfdfd' : '#e8e7f9',
           padding: '2%',
           width: '96%',
          }}
         >
          <div
           style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}
          >
           <span style={{ fontSize: '14px' }}>{getTypeIcon(item.type)}</span>
           <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: '14px' }}>
             {translatedContent.title}
            </Text>
            <div style={{ margin: '4px 0', fontSize: '13px' }}>
             {translatedContent.message}
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
       };
      })
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
   <Space>
    <Badge count={unreadCount} size="small" overflowCount={9} offset={[6, -3]}>
     <i className="notification-bell fa-light fa-bell fa-2xl" />
    </Badge>
   </Space>
  </Dropdown>
 );
};

export default NotificationBell;
