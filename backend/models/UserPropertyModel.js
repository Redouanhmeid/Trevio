module.exports = (db, type) => {
 const { Op } = require('sequelize');
 const userProperty = db.define(
  'userproperty',
  {
   id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   clientId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'users',
     key: 'id',
    },
   },
   conciergeId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'users',
     key: 'id',
    },
   },
   propertyId: {
    type: type.INTEGER,
    allowNull: false,
    references: {
     model: 'properties',
     key: 'id',
    },
   },
   assignedAt: {
    type: type.DATE,
    defaultValue: type.NOW,
    allowNull: false,
   },
   status: {
    type: type.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
   },
  },
  {
   indexes: [],
  }
 );

 // Add a unique constraint to ensure one property can only be assigned once
 userProperty.addHook('beforeCreate', async (assignment, options) => {
  const existingAssignment = await userProperty.findOne({
   where: {
    propertyId: assignment.propertyId,
    status: 'active',
    conciergeId: { [Op.ne]: assignment.conciergeId }, // Only check assignments to OTHER concierges
   },
  });

  if (existingAssignment) {
   throw new Error('This property is already assigned to a concierge');
  }
 });

 return userProperty;
};
