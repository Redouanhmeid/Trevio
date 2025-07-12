module.exports = (db, type) => {
 let nearbyPlace = db.define('nearbyPlace', {
  id: {
   type: type.INTEGER,
   primaryKey: true,
   autoIncrement: true,
  },
  name: {
   type: type.STRING(50),
   allowNull: false,
  },
  address: {
   type: type.STRING,
   allowNull: false,
   charset: 'utf8mb4',
   collate: 'utf8mb4_unicode_ci',
  },
  latitude: {
   type: type.FLOAT,
   allowNull: false,
  },
  longitude: {
   type: type.FLOAT,
   allowNull: false,
  },
  photo: {
   type: type.STRING(400),
   allowNull: true,
  },
  url: {
   type: type.STRING(90),
   allowNull: true,
  },
  rating: {
   type: type.FLOAT,
   allowNull: true,
  },
  types: {
   type: type.JSON,
   allowNull: true,
  },
  isVerified: {
   type: type.BOOLEAN,
   defaultValue: false,
   allowNull: false,
  },
 });
 nearbyPlace.createNearbyPlace = async (nearbyPlaceData) => {
  return await nearbyPlace.create(nearbyPlaceData);
 };
 return nearbyPlace;
};
