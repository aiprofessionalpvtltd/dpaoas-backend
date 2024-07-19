const db = require("../models");

module.exports = (sequelize, Sequelize) => {
    const motionMovers = sequelize.define("motionMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMotionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'motions',
                key: 'id'
            }
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    motionMovers.associate = function (models) {
        motionMovers.belongsTo(models.members, { foreignKey: 'fkMemberId', as: 'members' });
        //     requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
        //     requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
    };
    return motionMovers;
};