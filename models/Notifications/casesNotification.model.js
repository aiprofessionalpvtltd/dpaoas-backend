module.exports = (sequelize, Sequelize) => {
  const CasesNotification = sequelize.define("CasesNotification", {
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
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  });

  CasesNotification.associate = function (models) {
    CasesNotification.belongsTo(models.users, { foreignKey: 'userId', as: 'users' });
  };

  return CasesNotification;
};