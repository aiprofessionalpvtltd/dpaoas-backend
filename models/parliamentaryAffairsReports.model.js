module.exports = (sequelize, Sequelize) => {
    const parliamentaryAffairsReports = sequelize.define("parliamentaryAffairsReports", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ministerTenureId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'tenuresMinisters',
                key: 'id'
            }
        },
        ministerParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'parliamentaryYearsMna',
                key: 'id'
            }
        },
        ministerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'mnas',
                key: 'id'
            }
        },
        ministryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    }, {
        tableName: 'parliamentaryAffairsReports',
        freezeTableName: true
    });
    
    parliamentaryAffairsReports.associate = function(models) {
        parliamentaryAffairsReports.belongsTo(models.tenuresMinisters, {
            foreignKey: 'ministerTenureId',
            as: 'tenuresMinisters'
        });
        parliamentaryAffairsReports.belongsTo(models.parliamentaryYearsMna, {
            foreignKey: 'ministerParliamentaryYearId',
            as: 'parliamentaryYearsMna'
        });
        parliamentaryAffairsReports.belongsTo(models.mnas, {
            foreignKey: 'ministerId',
            as: 'minister'
        });
        parliamentaryAffairsReports.belongsTo(models.ministries, {
            foreignKey: 'ministryId',
            as: 'ministry'
        });
    };

    return parliamentaryAffairsReports;
};