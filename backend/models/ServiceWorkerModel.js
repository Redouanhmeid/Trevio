module.exports = (db, type) => {
 const serviceWorker = db.define('serviceworker', {
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
  name: {
   type: type.STRING(100),
   allowNull: false,
  },
  category: {
   type: type.ENUM(
    'co-host',
    'plumber',
    'technician',
    'housekeeper',
    'concierge',
    'electrician',
    'tv_technician',
    'grocery',
    'other'
   ),
   allowNull: false,
  },
  phone: {
   type: type.STRING(50),
   allowNull: false,
  },
  email: {
   type: type.STRING(100),
   allowNull: true,
  },
  notes: {
   type: type.TEXT,
   allowNull: true,
  },
  isVisibleToGuests: {
   type: type.BOOLEAN,
   defaultValue: true,
   allowNull: false,
  },
 });

 // Static methods for CRUD operations
 serviceWorker.findByProperty = async (propertyId) => {
  return await serviceWorker.findAll({
   where: { propertyId },
   order: [['category', 'ASC']],
  });
 };

 serviceWorker.findWorkerById = async (id) => {
  return await serviceWorker.findByPk(id);
 };

 serviceWorker.createWorker = async (workerData) => {
  return await serviceWorker.create(workerData);
 };

 return serviceWorker;
};
