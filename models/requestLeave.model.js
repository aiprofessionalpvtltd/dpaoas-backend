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
      allowNull: false
    },
    requestEndDate: {
      type: Sequelize.DATE,
      allowNull: false

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
      type: Sequelize.STRING,
      allowNull: true
    },
    requestNumberOfDays: {
      type: Sequelize.STRING,
      allowNull: true
    },
    requestStationLeave: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    requestLeaveAttachment: {
      type: Sequelize.STRING,
      allowNull: true
    },
    requestLeaveSubmittedTo: {
      type: Sequelize.STRING,
      allowNull: true
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
    requestLeaves.belongsTo(db.users, { foreignKey: 'fkUserId', as: 'users' });
    requestLeaves.hasMany(models.leaveComments);
  };
  return requestLeaves;
};