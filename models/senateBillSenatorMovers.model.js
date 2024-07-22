module.exports = (sequelize, Sequelize) => {
    const SenateBillSenatorMovers = sequelize.define("senateBillSenatorMovers", {
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
        fkSenatorId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SenateBillSenatorMovers.associate = function (models) {
        SenateBillSenatorMovers.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillSenatorMovers' });
        SenateBillSenatorMovers.belongsTo(models.members, { foreignKey: 'fkSenatorId', as: 'member' });
    };


    return SenateBillSenatorMovers;
};