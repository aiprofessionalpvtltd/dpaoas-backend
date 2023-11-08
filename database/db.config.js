module.exports = {
  HOST: "localhost",
  USER: "postgres",
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DBNAME,
  dialect: "postgres",
  port: process.env.DB_PORT
};
