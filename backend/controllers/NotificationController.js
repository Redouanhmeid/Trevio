// controllers/NotificationController.js
const { Notification, User, Property } = require('../models');
const nodemailer = require('nodemailer');
const sendNotificationMail = require('../helpers/notificationMail');

// Initialize email transporter only if SMTP config is available
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
 transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
   user: process.env.SMTP_USER,
   pass: process.env.SMTP_PASS,
  },
 });
}

// Create a new notification
const createNotification = async (req, res) => {
 try {
  const notificationData = req.body;

  // Create notification in database
  const notification = await Notification.createNotification(notificationData);

  // Send email if channel is email
  if (notification.channel === 'email') {
   try {
    const user = await User.findByPk(notification.userId);

    if (user && user.email) {
     await sendNotificationMail({
      email: user.email,
      subject: notification.title,
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">${notification.title}</h2>
                  <div style="padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                    ${notification.message}
                  </div>
                  <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Cette notification a été envoyée automatiquement par Trevio.ma
                  </p>
                </div>
              `,
     });

     // Update notification status to sent
     await notification.update({ status: 'sent', sentAt: new Date() });
    }
   } catch (emailError) {
    console.log('Email sending failed:', emailError);
    await notification.update({ status: 'failed' });
   }
  } else {
   // If not email, mark as sent
   await notification.update({ status: 'sent', sentAt: new Date() });
  }

  res.status(201).json(notification);
 } catch (error) {
  console.error('Error creating notification:', error);
  res.status(500).json({ error: 'Failed to create notification' });
 }
};

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
 try {
  const { userId } = req.params;
  const notifications = await Notification.findAll({
   where: { userId },
   order: [['createdAt', 'DESC']],
   include: [
    {
     model: Property,
     as: 'property',
     attributes: ['id', 'name'],
    },
   ],
  });
  res.status(200).json(notifications);
 } catch (error) {
  console.error('Error getting notifications:', error);
  res.status(500).json({ error: 'Failed to get notifications' });
 }
};

// Get all notifications for a specific property
const getPropertyNotifications = async (req, res) => {
 try {
  const { propertyId } = req.params;
  const notifications = await Notification.findAll({
   where: { propertyId },
   order: [['createdAt', 'DESC']],
   include: [
    {
     model: User,
     as: 'user',
     attributes: ['id', 'firstname', 'lastname'],
    },
   ],
  });
  res.status(200).json(notifications);
 } catch (error) {
  console.error('Error getting property notifications:', error);
  res.status(500).json({ error: 'Failed to get property notifications' });
 }
};

// Mark notification as read
const markAsRead = async (req, res) => {
 try {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);

  if (!notification) {
   return res.status(404).json({ error: 'Notification not found' });
  }

  await notification.update({
   read: true,
   readAt: new Date(),
  });

  res.status(200).json(notification);
 } catch (error) {
  console.error('Error marking notification as read:', error);
  res.status(500).json({ error: 'Failed to mark notification as read' });
 }
};

// Delete a notification
const deleteNotification = async (req, res) => {
 try {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);

  if (!notification) {
   return res.status(404).json({ error: 'Notification not found' });
  }

  await notification.destroy();
  res.status(200).json({ message: 'Notification deleted successfully' });
 } catch (error) {
  console.error('Error deleting notification:', error);
  res.status(500).json({ error: 'Failed to delete notification' });
 }
};

// Get unread notifications count for a user
const getUnreadCount = async (req, res) => {
 try {
  const { userId } = req.params;
  const count = await Notification.count({
   where: {
    userId,
    read: false,
   },
  });
  res.status(200).json({ unreadCount: count });
 } catch (error) {
  console.error('Error getting unread count:', error);
  res.status(500).json({ error: 'Failed to get unread notifications count' });
 }
};

// Bulk mark notifications as read
const bulkMarkAsRead = async (req, res) => {
 try {
  const { userId } = req.params;
  await Notification.update(
   {
    read: true,
    readAt: new Date(),
   },
   {
    where: {
     userId,
     read: false,
    },
   }
  );
  res.status(200).json({ message: 'All notifications marked as read' });
 } catch (error) {
  console.error('Error bulk marking notifications as read:', error);
  res.status(500).json({ error: 'Failed to mark notifications as read' });
 }
};

module.exports = {
 createNotification,
 getUserNotifications,
 getPropertyNotifications,
 markAsRead,
 deleteNotification,
 getUnreadCount,
 bulkMarkAsRead,
};
