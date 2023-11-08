const dbConfig = require("../database/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  logging: false
});
//console.log(sequelize)
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection to the database has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.roles = require("./roles.model.js")(sequelize, Sequelize);
db.users = require("./users.model.js")(sequelize, Sequelize);
db.permissions = require("./permissions.model")(sequelize,Sequelize);
db.userRoles = require("./usersRoles.model")(sequelize, Sequelize);
db.rolesPermissions = require("./rolesPermissions.model")(sequelize, Sequelize);
db.modulesPermissions = require("./modulesPermissions.model")(sequelize, Sequelize);
db.userSession = require("./userSession.model")(sequelize,Sequelize);
db.modules = require('./module.model')(sequelize, Sequelize);

sequelize.sync();

module.exports = db;