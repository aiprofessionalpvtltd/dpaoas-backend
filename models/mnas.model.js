module.exports = (sequelize, Sequelize) => {
    const Mnas = sequelize.define("mnas", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        mnaName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        constituency: {
            type: Sequelize.STRING,
            allowNull: true
        },
        address: {
            type: Sequelize.STRING,
            allowNull: true
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true
        },
        politicalParty: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'politicalParties',
                key: 'id'
            }
        },
        mnaStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    Mnas.associate = function (models) {
        Mnas.belongsTo(models.politicalParties, { foreignKey: 'politicalParty', as: 'politicalParties' });
    };

    return Mnas;
};