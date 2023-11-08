// // db.js
// const pgp = require('pg-promise')();
// const db = pgp({
//   user: 'postgres',
//   password: 'tiger',
//   host: 'localhost',
//   port: 5432,
//   database: 'SenateTesting01',
// });

// module.exports = db;

module.exports = {
  HOST: "localhost",
  USER: "postgres",
  PASSWORD: "85185",
  DB: "SenateTesting01",
  dialect: "postgres",
  port: 5432
};
