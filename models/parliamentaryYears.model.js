module.exports = (sequelize, Sequelize) => {
    const parliamentaryYears = sequelize.define("parliamentaryYears", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        parliamentaryTenure: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'tenures',
              key: 'id'
            }
        },
        fromDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        toDate: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active",
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    parliamentaryYears.associate = function(models) {
        parliamentaryYears.belongsTo(models.tenures, { foreignKey: 'fkTenureId'});
    };

    return parliamentaryYears;
};