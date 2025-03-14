module.exports = (db, type) => {
 let equipment = db.define('equipment', {
  id: {
   type: type.INTEGER,
   primaryKey: true,
   autoIncrement: true,
  },
  name: {
   type: type.STRING(25),
   allowNull: false,
  },
  description: {
   type: type.STRING(500),
   allowNull: true,
  },
  media: {
   type: type.STRING, // URL to image or video
   allowNull: true,
  },
  wifiName: {
   type: type.STRING(25),
   allowNull: true,
  },
  wifiPassword: {
   type: type.STRING(25),
   allowNull: true,
  },
 });

 equipment.createEquipment = async (equipmentData) => {
  return await equipment.create(equipmentData);
 };

 return equipment;
};
