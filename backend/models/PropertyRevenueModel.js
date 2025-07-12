module.exports = (db, type) => {
 const propertyRevenue = db.define('propertyrevenue', {
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
  reservationId: {
   type: type.INTEGER,
   allowNull: true,
   references: {
    model: 'reservations',
    key: 'id',
   },
  },
  amount: {
   type: type.DECIMAL(10, 2),
   allowNull: false,
  },
  startDate: {
   type: type.DATEONLY,
   allowNull: false,
  },
  endDate: {
   type: type.DATEONLY,
   allowNull: false,
  },
  notes: {
   type: type.STRING(500),
   allowNull: true,
  },
  createdBy: {
   type: type.INTEGER,
   allowNull: false,
  },
 });

 return propertyRevenue;
};
