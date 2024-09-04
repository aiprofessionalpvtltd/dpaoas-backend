module.exports = (sequelize, Sequelize) => {
    const Flag = sequelize.define("flags", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      flag: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      fkBranchId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "branches",
          key: "id",
        },
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
    Flag.associate = function (models) {
      Flag.belongsTo(models.branches, {
        foreignKey: "fkBranchId",
        as: "branch",
      });

      Flag.hasOne(models.noteParagraphs, { as: "note", foreignKey: "fkFlagId" });

    };

    return Flag;
  };