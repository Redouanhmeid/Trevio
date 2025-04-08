// import sequelize & schemas
const Sequelize = require('sequelize');
const db = require('../config/database');

// Import models
const UserModel = require('./UserModel');
const UserVerificationModel = require('./UserVerificationModel');
const UserPropertyModel = require('./UserPropertyModel');
const PropertyModel = require('./PropertyModel');
const ReservationModel = require('./ReservationModel');
const ReservationContractModel = require('./ReservationContractModel');
const PropertyRevenueModel = require('./PropertyRevenueModel');
const PropertyTaskModel = require('./PropertyTaskModel');
const NotificationModel = require('./NotificationModel');
const EquipmentModel = require('./EquipmentModel');
const NearbyPlaceModel = require('./NearbyPlaceModel');
const PasswordResetModel = require('./PasswordResetModel');
const ManagerInvitationModel = require('./ManagerInvitationModel');
const ServiceWorkerModel = require('./ServiceWorkerModel');

// create models
const User = UserModel(db, Sequelize);
const UserVerification = UserVerificationModel(db, Sequelize);
const UserProperty = UserPropertyModel(db, Sequelize);
const Property = PropertyModel(db, Sequelize);
const Reservation = ReservationModel(db, Sequelize);
const ReservationContract = ReservationContractModel(db, Sequelize);
const PropertyRevenue = PropertyRevenueModel(db, Sequelize);
const PropertyTask = PropertyTaskModel(db, Sequelize);
const Notification = NotificationModel(db, Sequelize);
const Equipment = EquipmentModel(db, Sequelize);
const NearbyPlace = NearbyPlaceModel(db, Sequelize);
const PasswordReset = PasswordResetModel(db, Sequelize);
const ManagerInvitation = ManagerInvitationModel(db, Sequelize);
const ServiceWorker = ServiceWorkerModel(db, Sequelize);

// Define relationships
// User - Property relationship (ownership)
User.hasMany(Property, {
 foreignKey: 'clientId',
 as: 'ownedProperties',
 onDelete: 'CASCADE',
});

Property.belongsTo(User, {
 foreignKey: 'clientId',
 as: 'owner',
});
// User (Client) - User (Concierge) relationship through UserProperty
User.belongsToMany(Property, {
 through: UserProperty,
 foreignKey: 'clientId',
 as: 'assignedProperties',
});
User.belongsToMany(Property, {
 through: UserProperty,
 foreignKey: 'conciergeId',
 as: 'managedProperties',
});
Property.belongsToMany(User, {
 through: UserProperty,
 foreignKey: 'propertyId',
 as: 'managers',
});

// UserProperty associations
UserProperty.belongsTo(User, {
 foreignKey: 'clientId',
 as: 'client',
});
UserProperty.belongsTo(User, {
 foreignKey: 'conciergeId',
 as: 'manager',
});
UserProperty.belongsTo(Property, {
 foreignKey: 'propertyId',
 as: 'property',
});

// Property & Equipment relationship
Property.hasMany(Equipment, {
 foreignKey: 'propertyId',
 onDelete: 'CASCADE',
});

Equipment.belongsTo(Property, {
 foreignKey: 'propertyId',
});

// Reservation relationships
Property.hasMany(Reservation, {
 foreignKey: 'propertyId',
 onDelete: 'CASCADE',
});

Reservation.belongsTo(Property, {
 foreignKey: 'propertyId',
});

User.hasMany(Reservation, {
 foreignKey: 'createdByUserId',
 as: 'createdReservations',
});

Reservation.belongsTo(User, {
 foreignKey: 'createdByUserId',
 as: 'creator',
});

// ReservationContract relationships
ReservationContract.belongsTo(Property, {
 foreignKey: 'propertyId',
 as: 'property',
});
Property.hasMany(ReservationContract, {
 foreignKey: 'propertyId',
 as: 'contracts',
});
Reservation.hasOne(ReservationContract, {
 foreignKey: 'reservationId',
 as: 'contract',
 onDelete: 'CASCADE',
});
ReservationContract.belongsTo(Reservation, {
 foreignKey: 'reservationId',
 as: 'reservation',
});

// PropertyRevenue relationships
Property.hasMany(PropertyRevenue, {
 foreignKey: 'propertyId',
 onDelete: 'CASCADE',
});

PropertyRevenue.belongsTo(Property, {
 foreignKey: 'propertyId',
 as: 'property',
});

Reservation.hasMany(PropertyRevenue, {
 foreignKey: 'reservationId',
 onDelete: 'CASCADE',
});

PropertyRevenue.belongsTo(Reservation, {
 foreignKey: 'reservationId',
});

// PropertyTask relationships
Property.hasMany(PropertyTask, {
 foreignKey: 'propertyId',
 as: 'tasks',
 onDelete: 'CASCADE',
});

PropertyTask.belongsTo(Property, {
 foreignKey: 'propertyId',
 as: 'property',
});

User.hasMany(PropertyTask, {
 foreignKey: 'createdBy',
 as: 'createdTasks',
});
PropertyTask.belongsTo(User, {
 foreignKey: 'createdBy',
 as: 'creator',
});

// Notification relationships
User.hasMany(Notification, {
 foreignKey: 'userId',
 as: 'notifications',
 onDelete: 'CASCADE',
});

Notification.belongsTo(User, {
 foreignKey: 'userId',
 as: 'user',
});

Property.hasMany(Notification, {
 foreignKey: 'propertyId',
 as: 'notifications',
 onDelete: 'CASCADE',
});

Notification.belongsTo(Property, {
 foreignKey: 'propertyId',
 as: 'property',
});

// User verification relationship
User.hasOne(UserVerification, {
 foreignKey: 'email',
 sourceKey: 'email',
 as: 'verification',
});

UserVerification.belongsTo(User, {
 foreignKey: 'email',
 targetKey: 'email',
 as: 'user',
});

// Password reset relationship
User.hasMany(PasswordReset, {
 foreignKey: 'email',
 sourceKey: 'email',
 as: 'passwordResets',
});

PasswordReset.belongsTo(User, {
 foreignKey: 'email',
 targetKey: 'email',
 as: 'user',
});

// ManagerInvitation User relationship
ManagerInvitation.belongsTo(User, {
 foreignKey: 'clientId',
 as: 'client',
});

// ServiceWorker relationship with Property
Property.hasMany(ServiceWorker, {
 foreignKey: 'propertyId',
 as: 'serviceWorkers',
 onDelete: 'CASCADE',
});

ServiceWorker.belongsTo(Property, {
 foreignKey: 'propertyId',
});

// generate tables in DB
db.sync({ alter: false }).then(() => {
 console.log('Tables Altered and Synced!');
});

module.exports = {
 User,
 UserVerification,
 UserProperty,
 Property,
 Reservation,
 ReservationContract,
 PropertyRevenue,
 PropertyTask,
 Notification,
 Equipment,
 NearbyPlace,
 PasswordReset,
 ManagerInvitation,
 ServiceWorker,
};
