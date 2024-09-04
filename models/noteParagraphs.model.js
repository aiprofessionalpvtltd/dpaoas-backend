module.exports = (sequelize, Sequelize) => {
  const NoteParagraphs = sequelize.define("noteParagraphs", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fkCaseNoteId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        key: "id",
        model: "caseNotes",
      },
    },
    paragraphTitle: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    paragraph: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    flags: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    status: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: "active",
    },

    fkFlagId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        key: "id",
        model: "flags",
      },
    },
    fkCorrespondenceId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
          key: 'id',
          model: 'correspondences'
      }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
    createdBy: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  });

  NoteParagraphs.associate = function (models) {
    NoteParagraphs.belongsTo(models.users, {
      foreignKey: "createdBy",
      as: "createdByUser",
    });

    NoteParagraphs.belongsTo(models.flags, {
      foreignKey: "fkFlagId",
      as: "flag",
    });

    NoteParagraphs.belongsTo(models.correspondences, {
      foreignKey: "fkCorrespondenceId",
      as: "correspondence",
    });
  };

  return NoteParagraphs;
};