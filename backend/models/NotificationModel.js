// models/NotificationModel.js
module.exports = (db, type) => {
 const notification = db.define(
  'notification',
  {
   id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   userId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'users',
     key: 'id',
    },
   },
   propertyId: {
    type: type.INTEGER,
    allowNull: true,
    references: {
     model: 'properties',
     key: 'id',
    },
   },
   title: {
    type: type.STRING(200),
    allowNull: false,
   },
   message: {
    type: type.TEXT,
    allowNull: false,
   },
   type: {
    type: type.ENUM('revenue_update', 'task_update', 'property_update'),
    allowNull: false,
   },
   channel: {
    type: type.ENUM('email', 'sms', 'whatsapp'),
    allowNull: false,
    defaultValue: 'email',
   },
   status: {
    type: type.ENUM('pending', 'sent', 'failed'),
    defaultValue: 'pending',
    allowNull: false,
   },
   read: {
    type: type.BOOLEAN,
    defaultValue: false,
   },
   sentAt: {
    type: type.DATE,
    allowNull: true,
   },
   readAt: {
    type: type.DATE,
    allowNull: true,
   },
  },
  {
   indexes: [
    {
     name: 'notification_user_idx',
     fields: ['userId'],
    },
    {
     name: 'notification_property_idx',
     fields: ['propertyId'],
    },
   ],
  }
 );

 // Helper method to create a notification
 notification.createNotification = async (notificationData) => {
  return await notification.create(notificationData);
 };

 return notification;
};
