const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

module.exports = new Sequelize(
 config.database,
 config.username,
 config.password,
 {
  host: config.host || 'localhost',
  dialect: 'mysql',
  charset: config.charset,
  collate: config.collate,
  logging: config.logging || true,
 }
);
