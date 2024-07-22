module.exports = (sequelize, Sequelize) => {
    const motionMotionLists = sequelize.define("motionMotionLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMotionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motions',
                key: 'id'
            }
        },
        fkMotionListId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motionLists',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    motionMotionLists.associate = function (models) {
        motionMotionLists.belongsTo(models.motionLists, { foreignKey: 'fkMotionListId' });
        motionMotionLists.belongsTo(models.motions, { foreignKey: 'fkMotionId' });
    };

    return motionMotionLists;
};