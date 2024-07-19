module.exports = (sequelize, Sequelize) => {
    const manageSessions = sequelize.define("manageSessions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        fkSessionMemberId: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true
        },

        fkSessionBreakId: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true
        },

        sessionAdjourned: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        sittingDate: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        sittingStartTime: {
            type: Sequelize.STRING,
            allowNull: false
        },

        sittingEndTime: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        committeeWhole: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        committeeStartTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        committeeEndTime: {
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

    manageSessions.associate = function (models) {
        manageSessions.belongsTo(models.sessions, { foreignKey: 'fkSessionId' });
    };

    return manageSessions;
};