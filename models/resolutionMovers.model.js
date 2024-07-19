module.exports = (sequelize, Sequelize) => {
    const resolutionMovers = sequelize.define("resolutionMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkResolutionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'resolutions',
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

    resolutionMovers.associate = function (models) {
        resolutionMovers.belongsTo(models.resolutions, { foreignKey: 'fkResolutionId', as: 'resolution' });
        resolutionMovers.belongsTo(models.members, { foreignKey: 'fkMemberId', as: 'member' });
    };


    return resolutionMovers;
};