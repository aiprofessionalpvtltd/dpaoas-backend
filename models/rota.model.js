module.exports = (sequelize, Sequelize) => {
    const rota = sequelize.define("rota", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        fkGroupId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'groups',
                key: 'id'
            }
        },

        startDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        endDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        allotmentType: {
            type: Sequelize.ENUM("Regular Days", "Tuesday/Friday", "Wednesday/Friday", "Alternate Days"),
            allowNull: false,
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    rota.associate = function (models) {
        rota.belongsTo(models.sessions, { foreignKey: 'fkSessionId' })
        rota.belongsTo(models.groups, { foreignKey: 'fkGroupId' })

    };

    return rota;
};