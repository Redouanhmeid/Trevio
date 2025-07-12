module.exports = (db, type) => {
 const { Op } = require('sequelize');
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

 // Static method to purge expired invitations
 managerInvitation.purgeExpiredInvitations = async function () {
  const now = new Date();
  // Find and delete all expired invitations
  const result = await this.destroy({
   where: {
    expiresAt: { [Op.lt]: now },
    status: 'pending',
   },
  });

  return result; // Return number of deleted invitations
 };

 return managerInvitation;
};
