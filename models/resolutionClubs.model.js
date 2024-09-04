module.exports = (sequelize, Sequelize) => {
    const resolutionClubs = sequelize.define("resolutionClubs", {
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
        linkedResolutionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'resolutions',
                key: 'id'
            }
        },
    });

    resolutionClubs.associate = function (models) {
        resolutionClubs.belongsTo(models.resolutions, { foreignKey: 'fkResolutionId', as: 'mainResolution' });
        resolutionClubs.belongsTo(models.resolutions, { foreignKey: 'linkedResolutionId', as: 'linkedResolution' });
    };

    return resolutionClubs;
};
