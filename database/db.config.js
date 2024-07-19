module.exports = {
  HOST: process.env.DB_HOST,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DBNAME,
  DIALECT: 'postgres', // Set to 'postgres' for PostgreSQL
  PORT: process.env.DB_PORT
};