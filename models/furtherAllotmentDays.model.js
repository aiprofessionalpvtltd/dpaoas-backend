module.exports = (sequelize, Sequelize) => {
    const furtherAllotmentDays = sequelize.define("furtherAllotmentDays", {
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

    furtherAllotmentDays.associate = function (models) {
        furtherAllotmentDays.belongsTo(models.sessions, { foreignKey: 'fkSessionId' })
        furtherAllotmentDays.belongsTo(models.groups, { foreignKey: 'fkGroupId' })

    };

    return furtherAllotmentDays;
};