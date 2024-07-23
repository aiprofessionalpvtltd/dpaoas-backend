module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userStatus: {
      type: Sequelize.ENUM("active", "inactive", "locked"),
      defaultValue: "active",
      allowNull: false,
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 3, // Set the number of login attempts
    },

    fkRoleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  Users.associate = function (models) {
    Users.hasOne(models.employees, { as: "employee", foreignKey: "fkUserId" });
    Users.belongsTo(models.roles, { foreignKey: "fkRoleId", as: "role" });
    Users.hasMany(models.noteParagraphs, {
      foreignKey: "createdBy",
      as: "noteParagraphs",
    });
  };

  return Users;
};
