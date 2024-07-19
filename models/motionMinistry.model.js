const db = require("../models");

module.exports = (sequelize, Sequelize) => {
    const motionMinistries = sequelize.define("motionMinistries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'ministries',
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
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    motionMinistries.associate = function (models) {
        motionMinistries.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
    };
    return motionMinistries;
};