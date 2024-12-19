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
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenures',
                key: 'id',
            },
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ministries.associate = function (models) {
        ministries.belongsToMany(models.mnas, { through: 'mnaMinistries', foreignKey: 'ministryId', as: 'mnas' });
        ministries.belongsTo(models.tenures, {
            foreignKey: "fkTenureId",
            as: "tenure",
        });
    };

    return ministries;
};