module.exports = (db, type) => {
 const managerInvitation = db.define('managerinvitation', {
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
  invitedEmail: {
   type: type.STRING(50),
   allowNull: false,
  },
  token: {
   type: type.STRING(64),
   allowNull: false,
   unique: true,
  },
  status: {
   type: type.ENUM('pending', 'accepted', 'expired'),
   defaultValue: 'pending',
   allowNull: false,
  },
  expiresAt: {
   type: type.DATE,
   allowNull: false,
  },
  createdAt: {
   type: type.DATE,
   defaultValue: type.NOW,
  },
 });

 return managerInvitation;
};
