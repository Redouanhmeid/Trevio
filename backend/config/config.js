require('dotenv').config({ path: './.env.development' });
require('dotenv').config({ path: './.env.production' });

module.exports = {
 development: {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  charset: process.env.CHARSET,
  collate: process.env.COLLATE,
 },
 production: {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  charset: process.env.CHARSET,
  collate: process.env.COLLATE,
  logging: false,
 },
};
