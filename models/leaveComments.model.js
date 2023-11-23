module.exports = (sequelize, Sequelize) => {
  const LeaveComments = sequelize.define("leaveComments", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    leaveComment: {
      type: Sequelize.STRING,
      allowNull: true

    },
    fkRequestLeaveId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'requestLeaves',
        key: 'id'
      }
    },
    commentedBy: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  LeaveComments.associate = function (models) {
    LeaveComments.belongsTo(models.requestLeaves);
    LeaveComments.belongsTo(models.users, { foreignKey: 'commentedBy', as: 'users' });
    // other associations...
  };

  return LeaveComments;
};