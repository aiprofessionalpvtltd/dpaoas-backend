module.exports = (sequelize, Sequelize) => {
    const introducedInHouses = sequelize.define("introducedInHouses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkIntroducedInHouseId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'introducedInSenateBills',
                key: 'id'
            }
        },
        fkSessionHouseId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        fkManageCommitteeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'manageCommittees',
                key: 'id'
            }
        },
        introducedInHouseDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        referedOnDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        committeeRecomendation: {
            type: Sequelize.ENUM("Ammended By Standing Committee", "May be Passed as Introduced in the House", "Passed without sending to Committee"),
            allowNull: true,
        },
        reportPresentationDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    introducedInHouses.associate = function (models) {
        introducedInHouses.belongsTo(models.sessions, { foreignKey: 'fkSessionHouseId', as: 'sessions' });
        introducedInHouses.belongsTo(models.manageCommittees, { foreignKey: 'fkManageCommitteeId', as: 'manageCommittees' });
        introducedInHouses.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInHouseId', as: 'introducedInSenateBills' });
    };

    return introducedInHouses;
};