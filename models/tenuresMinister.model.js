const db = require(".");

module.exports = (sequelize, Sequelize) => {
  const TenuresMinister = sequelize.define("tenuresMinisters", {
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

  TenuresMinister.associate = function (models) {
    TenuresMinister.hasMany(models.members, {
      foreignKey: "fkMinisterTenureId",
      as: "members",
    });
  };

  return TenuresMinister;
};
