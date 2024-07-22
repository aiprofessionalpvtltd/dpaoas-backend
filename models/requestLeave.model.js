const db = require("../models");

module.exports = (sequelize, Sequelize) => {
  const requestLeaves = sequelize.define("requestLeaves", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fkRequestTypeId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'leaveTypes',
        key: 'id'
      }
    },
    fkUserId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    requestStartDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    requstEndDate: {
      type: Sequelize.DATE,
      allowNull: true

    },
    requestStatus: {
      type: Sequelize.ENUM("pending", "approved", "disapproved", "marked"),
      defaultValue: 'pending'
    },

    requestLeaveSubType: {
      type: Sequelize.ENUM("preApproved", "postApproved", "telephonicInformed"),
      defaultValue: 'postApproved'
    },

    requestLeaveReason: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    requestNumberOfDays: {
      type: Sequelize.STRING,
      allowNull: true
    },
    requestStationLeave: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    requestLeaveAttachment: {
      type: Sequelize.STRING,
      allowNull: true
    },
    requestLeaveSubmittedTo: {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
      model: 'users', // Assuming the table name is 'users'
      key: 'id',
    },
    },
    requestLeaveApplyOnBehalf: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    requestLeaveForwarder: {
      type: Sequelize.STRING,
      allowNull: true
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });
  requestLeaves.associate = function (models) {
    requestLeaves.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'users' });
    requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
    requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
  };
  return requestLeaves;
};