module.exports = (db, type) => {
 const { Op } = require('sequelize');
 const crypto = require('crypto');

 let reservationcontract = db.define(
  'reservationcontract',
  {
   id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   reservationId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'reservations',
     key: 'id',
    },
   },
   firstname: {
    type: type.STRING(50),
    allowNull: true,
   },
   lastname: {
    type: type.STRING(50),
    allowNull: true,
   },
   middlename: {
    type: type.STRING(50),
    allowNull: true, // Optional field in the form
   },
   birthDate: {
    type: type.DATEONLY,
    allowNull: true,
   },
   sex: {
    type: type.ENUM('MALE', 'FEMALE'),
    allowNull: true,
   },
   nationality: {
    type: type.STRING(50),
    allowNull: true,
   },
   email: {
    type: type.STRING(50),
    allowNull: true,
   },
   phone: {
    type: type.STRING(50),
    allowNull: true,
   },
   residenceCountry: {
    type: type.STRING(50),
    allowNull: true,
   },
   residenceCity: {
    type: type.STRING(50),
    allowNull: true,
   },
   residenceAddress: {
    type: type.STRING(200),
    allowNull: true,
   },
   residencePostalCode: {
    type: type.STRING(20),
    allowNull: true,
   },
   checkInDate: {
    type: type.DATEONLY,
    allowNull: true,
   },
   checkOutDate: {
    type: type.DATEONLY,
    allowNull: true,
   },
   documentType: {
    type: type.ENUM(
     'PASSPORT',
     'CIN',
     'DRIVING_LICENSE',
     'MOROCCAN_RESIDENCE',
     'FOREIGNER_RESIDENCE'
    ),
    allowNull: true,
   },
   documentNumber: {
    type: type.STRING(50),
    allowNull: true,
   },
   documentIssueDate: {
    type: type.DATEONLY,
    allowNull: true,
   },
   status: {
    type: type.ENUM('DRAFT', 'SENT', 'SIGNED', 'REJECTED', 'COMPLETED'),
    allowNull: false,
    defaultValue: 'DRAFT',
   },
   signatureImageUrl: {
    type: type.STRING(500),
    allowNull: true,
   },
   propertyId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'properties', // This should match your properties table name
     key: 'id',
    },
   },
   hashId: {
    type: type.STRING(12), // Store 12 characters
    unique: true,
    allowNull: true,
   },
  },
  {
   hooks: {
    beforeCreate: async (contract) => {
     // Generate hashId before saving
     const secret = process.env.HASH_SECRET || 'your-secret-key';
     const text = `${Date.now()}-${Math.random()}-${secret}`;
     contract.hashId = crypto
      .createHash('sha256')
      .update(text)
      .digest('hex')
      .substring(0, 12);
    },
    beforeUpdate: (instance) => {
     if (
      instance.changed('status') &&
      instance.previous('status') === 'DRAFT' &&
      ['SENT', 'SIGNED', 'COMPLETED'].includes(instance.status)
     ) {
      // Check if guest information is complete
      const requiredFields = [
       'firstname',
       'lastname',
       'birthDate',
       'sex',
       'nationality',
       'email',
       'phone',
       'residenceCountry',
       'residenceCity',
       'residenceAddress',
       'residencePostalCode',
       'documentType',
       'documentNumber',
       'documentIssueDate',
      ];

      for (const field of requiredFields) {
       if (!instance[field]) {
        throw new Error(
         `Field ${field} cannot be null when contract is being finalized`
        );
       }
      }
     }
    },
   },
  }
 );

 // Static method to find contract by hash
 reservationcontract.findByHash = async (hash) => {
  return await reservationcontract.findOne({
   where: { hashId: hash },
  });
 };

 // Instance method to get public URL
 reservationcontract.prototype.getPublicUrl = function () {
  return `/guest/contract/${this.hashId}`;
 };

 // Static methods
 reservationcontract.createContract = async (contractData) => {
  return await reservationcontract.create(contractData);
 };

 reservationcontract.findContractsByProperty = async (propertyId) => {
  return await reservationcontract.findAll({
   where: { propertyId: propertyId },
   order: [['createdAt', 'DESC']],
  });
 };

 reservationcontract.checkAvailability = async (
  propertyId,
  startDate,
  endDate
 ) => {
  // Find any overlapping reservations
  const overlappingContracts = await reservationcontract.findAll({
   where: {
    propertyId,
    status: {
     [Op.notIn]: ['REJECTED', 'DRAFT'], // Only check active bookings
    },
    [Op.or]: [
     // Case 1: New check-in date falls between an existing booking
     {
      [Op.and]: [
       { checkInDate: { [Op.lte]: endDate } },
       { checkOutDate: { [Op.gte]: startDate } },
      ],
     },
    ],
   },
   attributes: [
    'id',
    'checkInDate',
    'checkOutDate',
    'status',
    'firstname',
    'lastname',
   ],
  });

  // Create a map to store unique date ranges
  const uniqueBookings = new Map();

  overlappingContracts.forEach((contract) => {
   // Create a unique key using the dates
   const key = `${contract.checkInDate}_${contract.checkOutDate}`;

   if (!uniqueBookings.has(key)) {
    uniqueBookings.set(key, {
     checkIn: contract.checkInDate,
     checkOut: contract.checkOutDate,
     status: contract.status,
     // Only include guest name if you need it for debugging
     guest: `${contract.firstname} ${contract.lastname}`.trim(),
    });
   }
  });

  // Convert the Map values back to an array
  const conflictingBookings = Array.from(uniqueBookings.values());

  return {
   available: conflictingBookings.length === 0,
   conflictingBookings,
   totalConflicts: conflictingBookings.length,
  };
 };

 return reservationcontract;
};
