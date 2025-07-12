module.exports = (db, type) => {
 return db.define(
  'password_reset',
  {
   id: {
    type: type.INTEGER,
    primaryKey: true,
    autoIncrement: true,
   },
   email: {
    type: type.STRING(50),
    allowNull: false,
    references: {
     model: 'users',
     key: 'email',
    },
   },
   code: {
    type: type.STRING,
    allowNull: false,
   },
   expiresAt: {
    type: type.DATE,
    allowNull: false,
   },
  },
  {
   timestamps: false,
   indexes: [
    {
     name: 'email_idx',
     fields: ['email'],
    },
   ],
  }
 );
};
