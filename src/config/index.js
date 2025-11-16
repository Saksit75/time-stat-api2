require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 6000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  CLOUDIN_NAME: process.env.CLOUD_NAME || '',
  CLOUDIN_KEY: process.env.API_KEY || '',
  CLOUDIN_SECRET: process.env.API_SECRET || '',
  ORIGIN: process.env.ORIGIN || '',
};
