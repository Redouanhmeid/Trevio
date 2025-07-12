// models/PropertyTaskModel.js
module.exports = (db, type) => {
 const propertyTask = db.define('propertytask', {
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
  title: {
   type: type.STRING(200),
   allowNull: false,
  },
  priority: {
   type: type.ENUM('high', 'medium', 'low'),
   allowNull: false,
   defaultValue: 'medium',
  },
  dueDate: {
   type: type.DATE,
   allowNull: false,
  },
  notes: {
   type: type.TEXT,
   allowNull: true,
  },
  status: {
   type: type.ENUM('pending', 'in_progress', 'completed'),
   defaultValue: 'pending',
   allowNull: false,
  },
  createdBy: {
   type: type.INTEGER,
   allowNull: false,
   references: {
    model: 'users', // Reference the users table
    key: 'id',
   },
  },
 });

 return propertyTask;
};
