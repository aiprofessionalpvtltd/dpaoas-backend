module.exports = (sequelize, Sequelize) => {
    const SenateBillSenatorMovers = sequelize.define("senateBillSenatorMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkIntroducedInSenateBillId: {
            type: Sequelize.INTEGER,
            allowNull: true,
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
        fkMinisterTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenuresMinisters',
                key: 'id'
            }
        },
        fkFinanceMoneyBillId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'financeMoneyBills',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SenateBillSenatorMovers.associate = function (models) {
        SenateBillSenatorMovers.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillSenatorMovers' });
        SenateBillSenatorMovers.belongsTo(models.members, { foreignKey: 'fkSenatorId', as: 'member' });
        SenateBillSenatorMovers.belongsTo(models.financeMoneyBills, { foreignKey: 'fkFinanceMoneyBillId', as: 'senateBillSenatorMovers' });
    };

    return SenateBillSenatorMovers;
};