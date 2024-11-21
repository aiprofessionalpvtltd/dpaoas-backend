// models/FRNotification.js

module.exports = (sequelize, Sequelize) => {
    const FRNotification = sequelize.define("FRNotification", {
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
  
    FRNotification.associate = function (models) {
      FRNotification.belongsTo(models.users, { foreignKey: 'userId', as: 'users' });
    };
  
    return FRNotification;
  };  