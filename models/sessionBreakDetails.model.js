module.exports = (sequelize, Sequelize) => {
    const sessionBreakDetails = sequelize.define("sessionBreakDetails", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkSessionSittingId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'manageSessions',
                key: 'id'
            }
        },

        breakStartTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        breakEndTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    sessionBreakDetails.associate = function (models) {
        sessionBreakDetails.belongsTo(models.manageSessions, { foreignKey: 'fkSessionSittingId' })
    };

    return sessionBreakDetails;
};