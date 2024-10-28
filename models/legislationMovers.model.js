module.exports = (sequelize, Sequelize) => {
    const legislationMovers = sequelize.define("legislationMovers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fklegislationBillId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'legislativeBills',
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

    legislationMovers.associate = function (models) {
        legislationMovers.belongsTo(models.legislativeBills, { foreignKey: 'fklegislationBillId', as: 'legislativeBills' });
        legislationMovers.belongsTo(models.members, { foreignKey: 'fkMemberId', as: 'member' });
    };


    return legislationMovers;
};