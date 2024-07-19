module.exports = (sequelize, Sequelize) => {
    const sessionAttendances = sequelize.define("sessionAttendances", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkManageSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'manageSessions',
                key: 'id'
            }
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        attendanceStatus: {
            type: Sequelize.ENUM("Present", "Absent", "Leave", "Oath Not Taken", "Suspended" ,"Vacant"),
            defaultValue: "Present"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    sessionAttendances.associate = function (models) {
        sessionAttendances.belongsTo(models.manageSessions, { foreignKey: 'fkManageSessionId' });
        sessionAttendances.belongsTo(models.members, { foreignKey: 'fkMemberId' });

    };


    return sessionAttendances;
};