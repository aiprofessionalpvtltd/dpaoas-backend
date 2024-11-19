// models/ApprovedCaseNotification.js

module.exports = (sequelize, Sequelize) => {
    const ApprovedCaseNotification = sequelize.define("ApprovedCaseNotification", {
      notificationId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'users',
              key: 'id'
          }
      },
    }, {
      timestamps: true,
    });
  
    ApprovedCaseNotification.associate = function (models) {
      ApprovedCaseNotification.belongsTo(models.users, { foreignKey: 'userId', as: 'users' });
    };
  
    return ApprovedCaseNotification;
  };  
