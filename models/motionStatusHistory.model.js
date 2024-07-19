const db = require("../models");

module.exports = (sequelize, Sequelize) => {
    const motionStatusHistories = sequelize.define("motionStatusHistories", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        fkMotionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motions',
                key: 'id'
            }
        },
        fkMotionStatusId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motionStatuses',
                key: 'id'
            }
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    motionStatusHistories.associate = function (models) {
        motionStatusHistories.belongsTo(models.motionStatuses, { foreignKey: 'fkMotionStatusId', as: 'motionStatuses' });
        //     requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
        //     requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
    };
    return motionStatusHistories;
};