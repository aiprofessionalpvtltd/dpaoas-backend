const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const tenures = sequelize.define("tenures", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tenureName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fromDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    toDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active",
    },
    tenureType: {
      type: Sequelize.ENUM("Senators", "Ministers"),
      allowNull: false,
      defaultValue: "Senators",
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
  tenures.associate = function (models) {
    tenures.hasMany(models.members, {
      foreignKey: "fkTenureId",
      as: "members",
    });
  };
  return tenures;
};
