module.exports = (sequelize, Sequelize) => {
    const resolutionMinistries = sequelize.define("resolutionMinistries", {
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
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'ministries',
              key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    resolutionMinistries.associate = function (models) {
        resolutionMinistries.belongsTo(models.resolutions, { foreignKey: 'fkResolutionId', as: 'resolution' });
        resolutionMinistries.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
    };


    return resolutionMinistries;
};