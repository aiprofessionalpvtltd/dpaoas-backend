module.exports = (sequelize, Sequelize) => {
    const Questions = sequelize.define("questions", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fkSessionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sessions", // Table name
          key: "id",
        },
      },
      questionCategory: {
        type: Sequelize.ENUM("Starred", "Un-Starred", "Short Notice"),
        allowNull: true,
      },
      fkQuestionStatus: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "questionStatuses",
          key: "id",
        },
      },
      fkNoticeDiary: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "noticeOfficeDairies",
          key: "id",
        },
      },
      fkMemberId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "members",
          key: "id",
        },
      },
      questionImage: {
        type: Sequelize.ARRAY(Sequelize.STRING(1000)),
        allowNull: true,
      },
      englishText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      urduText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sentForTranslation: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      questionSentStatus: {
        type: Sequelize.ENUM("inQuestion", "toQuestion", "inNotice", "toTranslation"),
        defaultValue: "inNotice",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
    // Define model associations
    Questions.associate = function (models) {
      Questions.belongsTo(models.sessions, { foreignKey: "fkSessionId" });
      Questions.belongsTo(models.members, { foreignKey: "fkMemberId" });
      Questions.hasMany(models.translationRemarks, {
        as: "translationRemarks",
        foreignKey: "fkQuestionId",
      });
    };
  
    return Questions;
  };
  