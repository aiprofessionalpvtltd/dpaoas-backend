module.exports = (sequelize, Sequelize) => {
    const sessionMemberDetails = sequelize.define("sessionMemberDetails", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'members',
                key: 'id'
            }
        },

        fkSessionSittingId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'manageSessions',
                key: 'id'
            }
        },

        startTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        endTime: {
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

    sessionMemberDetails.associate = function (models) {
        sessionMemberDetails.belongsTo(models.members, { foreignKey: 'fkMemberId' });
        sessionMemberDetails.belongsTo(models.manageSessions, { foreignKey: 'fkSessionSittingId' })
    };

    return sessionMemberDetails;
};