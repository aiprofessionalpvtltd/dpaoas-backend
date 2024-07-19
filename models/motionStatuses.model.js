const db = require(".");

module.exports = (sequelize, Sequelize) => {
    const motionStatuses = sequelize.define("motionStatuses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        statusName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: true

        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    motionStatuses.associate = function (models) {
        motionStatuses.hasMany(models.motions, { foreignKey: 'fkMotionStatus', as: 'motionStatuses' });
    };
    return motionStatuses;
};