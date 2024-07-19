module.exports = (sequelize, Sequelize) => {
    const ordinances = sequelize.define("ordinances", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'parliamentaryYears',
                key: 'id'
            }
        },
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        fkOrdinanceStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'billStatuses',
                key: 'id'
            }
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        ordinanceTitle: {
            type: Sequelize.STRING,
            allowNull: true
        },
        ordinanceStatusDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        ordinanceRemarks: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        dateOfLayingInTheSenate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfLayingInTheNA: {
            type: Sequelize.DATE,
            allowNull: true
        },
        documentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        documentDiscription: {
            type: Sequelize.STRING,
            allowNull: true
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        ordinanceStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ordinances.associate = function (models) {
        ordinances.belongsTo(models.parliamentaryYears, { foreignKey: 'fkParliamentaryYearId', as: 'parliamentaryYears' });
        ordinances.belongsTo(models.billStatuses, { foreignKey: 'fkOrdinanceStatus', as: 'billStatuses' });
        ordinances.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessions' });
        ordinances.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
    };

    return ordinances;
};