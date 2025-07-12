module.exports = (db, type) => {
 let userVerification = db.define('userverification', {
  id: {
   type: type.INTEGER,
   autoIncrement: true,
   allowNull: false,
   primaryKey: true,
  },
  email: {
   type: type.STRING(50),
   allowNull: false,
   unique: true,
  },
  uniqueString: {
   type: type.STRING(190),
   allowNull: false,
  },
  createdAt: {
   type: type.DATE,
   allowNull: false,
  },
  expiresAt: {
   type: type.DATE,
   allowNull: false,
  },
 });

 userVerification.Create = async function (
  email,
  uniqueString,
  createdAt,
  expiresAt
 ) {
  const verification = await userVerification.create({
   email,
   uniqueString,
   createdAt,
   expiresAt,
  });
  return verification;
 };
 return userVerification;
};
