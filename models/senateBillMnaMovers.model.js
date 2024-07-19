module.exports = (sequelize, Sequelize) => {
    const SenateBillMnaMovers = sequelize.define("senateBillMnaMovers", {
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
        fkMnaId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'mnas',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SenateBillMnaMovers.associate = function (models) {
        SenateBillMnaMovers.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMnaMovers' });
        SenateBillMnaMovers.belongsTo(models.mnas, { foreignKey: 'fkMnaId', as: 'mna' });
    };


    return SenateBillMnaMovers;
};