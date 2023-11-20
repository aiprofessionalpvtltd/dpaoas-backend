//const dbConfig = require("../database/db.config");
const database = require("../database/db.config")
const SequelizeMain = require("sequelize");
const sequelize = new SequelizeMain(database.DB, database.USER, database.PASSWORD, {
  host: database.HOST,
  dialect: database.dialect,
  port: database.port,
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

db.Sequelize = SequelizeMain;
db.sequelize = sequelize;

db.roles = require("./roles.model.js")(sequelize, SequelizeMain);
db.users = require("./users.model.js")(sequelize, SequelizeMain);
db.permissions = require("./permissions.model")(sequelize,SequelizeMain);
db.userRoles = require("./usersRoles.model")(sequelize, SequelizeMain);
db.rolesPermissions = require("./rolesPermissions.model")(sequelize, SequelizeMain);
db.modulesPermissions = require("./modulesPermissions.model")(sequelize, SequelizeMain);
db.userSession = require("./userSession.model")(sequelize,SequelizeMain);
db.modules = require('./module.model')(sequelize, SequelizeMain);
db.leaveTypes = require('./leaveType.model')(sequelize,SequelizeMain);
db.requestLeaves = require('./requestLeave.model')(sequelize,SequelizeMain);
db.leaveComments = require('./leaveComments.model')(sequelize,SequelizeMain);
db.departments = require('./departments.model')(sequelize,SequelizeMain);
db.designations = require('./designations.model')(sequelize,SequelizeMain);
db.userDespartments= require('./usersDepartments.model')(sequelize,SequelizeMain);
db.userDesignations = require('./usersDesignations.model')(sequelize,SequelizeMain)
sequelize.sync();

module.exports = db;