const { Op } = require('sequelize');

module.exports = (db, type) => {
 const reservation = db.define(
  'reservation',
  {
   id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   propertyId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'properties',
     key: 'id',
    },
   },
   createdByUserId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'users',
     key: 'id',
    },
   },
   startDate: {
    type: type.DATEONLY,
    allowNull: false,
   },
   endDate: {
    type: type.DATEONLY,
    allowNull: false,
   },
   totalPrice: {
    type: type.DECIMAL(10, 2),
    allowNull: false,
   },
   bookingSource: {
    type: type.STRING(50),
    allowNull: true,
   },
   status: {
    type: type.ENUM('draft', 'sent', 'signed', 'confirmed', 'cancelled'),
    defaultValue: 'draft',
    allowNull: false,
   },
   hashId: {
    type: type.STRING(12),
    unique: true,
    allowNull: false,
   },
   electronicLockCode: {
    type: type.STRING(10),
    allowNull: true,
   },
   electronicLockEnabled: {
    type: type.BOOLEAN,
    defaultValue: false,
    allowNull: false,
   },
   calendarEventUID: {
    type: type.STRING(190),
    allowNull: true,
    unique: true,
   },
  },
  {
   hooks: {
    beforeCreate: async (reservation) => {
     const crypto = require('crypto');
     const secret = process.env.HASH_SECRET || 'your-secret-key';
     const text = `${Date.now()}-${Math.random()}-${secret}`;
     reservation.hashId = crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .substring(0, 12);
    },
   },
  }
 );

 // Static methods
 reservation.createReservation = async (reservationData) => {
  return await reservation.create(reservationData);
 };

 reservation.checkAvailability = async (
  propertyId,
  startDate,
  endDate,
  excludeReservationId = null
 ) => {
  // Build the where clause for overlapping date ranges
  const whereClause = {
   propertyId,
   status: {
    [Op.notIn]: ['cancelled', 'draft'], // Only check against active reservations
   },
   [Op.or]: [
    {
     // Start date falls within existing booking
     [Op.and]: [
      { startDate: { [Op.lte]: endDate } },
      { endDate: { [Op.gte]: startDate } },
     ],
    },
   ],
  };

  // If we're updating an existing reservation, exclude it from the check
  if (excludeReservationId) {
   whereClause.id = {
    [Op.ne]: excludeReservationId,
   };
  }

  const overlappingReservations = await reservation.findAll({
   where: whereClause,
  });

  return {
   available: overlappingReservations.length === 0,
   conflictingReservations: overlappingReservations,
  };
 };

 reservation.prototype.sendToGuest = async function (guestEmail) {
  // Implementation for sending reservation to guest
  // This could involve sending an email with a link to complete the contract
  const publicUrl = `/guest/reservation/${this.hashId}`;
  // Add email sending logic here
  return publicUrl;
 };

 return reservation;
};
