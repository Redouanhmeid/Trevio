import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../context/TranslationContext';

const useNotification = () => {
 const { t } = useTranslation();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const apiBase = '/api/v1/notifications';

 // Get all notifications for a user
 const getUserNotifications = async (userId) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/user/${userId}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Get all notifications for a property
 const getPropertyNotifications = async (propertyId) => {
  setLoading(true);
  try {
   const response = await axios.get(`${apiBase}/property/${propertyId}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Create a new notification
 const createNotification = async (notificationData) => {
  console.log(notificationData);
  setLoading(true);
  try {
   const response = await axios.post(`${apiBase}`, notificationData);
   console.log(response);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Mark notification as read
 const markAsRead = async (notificationId) => {
  setLoading(true);
  try {
   const response = await axios.put(`${apiBase}/${notificationId}/read`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Get unread notifications count
 const getUnreadCount = async (userId) => {
  try {
   const response = await axios.get(`${apiBase}/unread/${userId}`);
   return response.data.unreadCount;
  } catch (error) {
   setError(error);
   return 0;
  }
 };

 // Delete a notification
 const deleteNotification = async (notificationId) => {
  setLoading(true);
  try {
   const response = await axios.delete(`${apiBase}/${notificationId}`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 // Mark all notifications as read for a user
 const markAllAsRead = async (userId) => {
  setLoading(true);
  try {
   const response = await axios.put(`${apiBase}/user/${userId}/read-all`);
   return response.data;
  } catch (error) {
   setError(error);
   return null;
  } finally {
   setLoading(false);
  }
 };

 const createPropertyVerificationNotification = async (
  userId,
  propertyId,
  propertyName
 ) => {
  return await createNotification({
   userId,
   propertyId,
   titleKey: 'notification.messages.createTitle',
   messageKey: 'notification.messages.propertyVerified',
   messageParams: { propertyName },
   // Store the full translated message with values for display
   title: t('notification.messages.createTitle'),
   message: `${t(
    'notification.messages.propertyVerified.part1'
   )} '${propertyName}' ${t('notification.messages.propertyVerified.part2')}`,
   type: 'property_update',
   channel: 'email',
  });
 };

 // Helper function to create common notifications
 const createPropertyUpdateNotification = async (
  userId,
  propertyId,
  title,
  message
 ) => {
  return await createNotification({
   userId,
   propertyId,
   title,
   message,
   type: 'property_update',
   channel: 'email',
  });
 };

 const createRevenueUpdateNotification = async (
  userId,
  propertyId,
  amount,
  month,
  year
 ) => {
  const dateString = `${month}/${year}`;

  return await createNotification({
   userId,
   propertyId,
   titleKey: 'notification.messages.revenueTitle',
   messageKey: 'notification.messages.revenueAdded',
   messageParams: { amount, month, year },
   // Store the full translated message with values for display
   title: t('notification.messages.revenueTitle'),
   message: `${t('notification.messages.revenueAdded.part1')} ${amount} ${t(
    'notification.messages.revenueAdded.part2'
   )} ${dateString}`,
   type: 'revenue_update',
   channel: 'email',
  });
 };

 const createTaskUpdateNotification = async (
  userId,
  propertyId,
  taskTitle,
  priority
 ) => {
  return await createNotification({
   userId,
   propertyId,
   titleKey: 'notification.messages.taskTitle',
   messageKey: 'notification.messages.taskCreated',
   messageParams: { taskTitle, priority },
   // Store the full translated message with values for display
   title: t('notification.messages.taskTitle'),
   message: `${t('notification.messages.taskCreated.part1')} '${taskTitle}' ${t(
    'notification.messages.taskCreated.part2'
   )} ${priority} ${t('notification.messages.taskCreated.part3')}`,
   type: 'task_update',
   channel: 'email',
  });
 };

 return {
  loading,
  error,
  getUserNotifications,
  getPropertyNotifications,
  createNotification,
  markAsRead,
  getUnreadCount,
  deleteNotification,
  markAllAsRead,
  // Helper methods for common notifications
  createPropertyVerificationNotification,
  createPropertyUpdateNotification,
  createRevenueUpdateNotification,
  createTaskUpdateNotification,
 };
};

export default useNotification;
