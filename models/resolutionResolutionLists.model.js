module.exports = (sequelize, Sequelize) => {
    const resolutionResolutionLists = sequelize.define("resolutionResolutionLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkResolutionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'resolutions',
                key: 'id'
            }
        },
        fkResolutionListId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'resolutionLists',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    resolutionResolutionLists.associate = function (models) {
        resolutionResolutionLists.belongsTo(models.resolutionLists, { foreignKey: 'fkResolutionListId' });
        resolutionResolutionLists.belongsTo(models.resolutions, { foreignKey: 'fkResolutionId' });
    };

    return resolutionResolutionLists;
};