module.exports = (sequelize, Sequelize) => {
    const SenateBillMinistryMovers = sequelize.define("senateBillMinistryMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkIntroducedInSenateBillId: {
            type: Sequelize.INTEGER,
            allowNull: true,  // Changed from false to true
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

    SenateBillMinistryMovers.associate = function (models) {
        SenateBillMinistryMovers.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMinistryMovers' });
        SenateBillMinistryMovers.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministrie' });
        SenateBillMinistryMovers.belongsTo(models.financeMoneyBills, { foreignKey: 'fkFinanceMoneyBillId', as: 'senateBillMinistryMovers' });
    };

    return SenateBillMinistryMovers;
};