module.exports = (sequelize, Sequelize) => {
    const ministries = sequelize.define("ministries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ministryName: { 
            type: Sequelize.STRING,
            allowNull: false
        },
        ministryStatus: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkMinisterTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenuresMinisters',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ministries.associate = function (models) {
        ministries.belongsToMany(models.mnas, { through: 'mnaMinistries', foreignKey: 'ministryId', as: 'mnas' });
        ministries.belongsTo(models.tenuresMinisters, {
            foreignKey: "fkMinisterTenureId",
            as: "tenuresMinisters",
        });
    };

    return ministries;
};