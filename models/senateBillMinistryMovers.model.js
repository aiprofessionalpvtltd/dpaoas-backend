module.exports = (sequelize, Sequelize) => {
    const SenateBillMinistryMovers = sequelize.define("senateBillMinistryMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkIntroducedInSenateBillId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'introducedInSenateBills',
                key: 'id'
            }
        },
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SenateBillMinistryMovers.associate = function (models) {
        SenateBillMinistryMovers.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMinistryMovers' });
        SenateBillMinistryMovers.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministrie' });
    };


    return SenateBillMinistryMovers;
};