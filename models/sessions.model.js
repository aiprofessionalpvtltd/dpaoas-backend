module.exports = (sequelize, Sequelize) => {
    const sessions = sequelize.define("sessions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        sessionName: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        calledBy: {
            type: Sequelize.ENUM('President', 'Chairman'),
            allowNull: false,
        },

        isJointSession: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },

        startDate: {
            type: Sequelize.DATE,
            allowNull: false
        },

        endDate: {
            type: Sequelize.DATE,
            allowNull: false
        },

        legislationDiaryNo: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        legislationDiaryDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        businessStatus: {
            type: Sequelize.ENUM('Carry Forward', 'Lapsed'),
            allowNull: false,
        },

        businessSessions : {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true
        },

        fkParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'parliamentaryYears',
                key: 'id'
            }
        },

        isQuoraumAdjourned: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },

        summonNoticeDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        summonNoticeTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        jointSessionPurpose:{
            type: Sequelize.STRING,
            allowNull: true,
        },

        isProrogued: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },

        proroguedDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        
        sessionStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active",

        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    sessions.associate = function (models) {
        sessions.hasMany(models.motions, { foreignKey: 'fkSessionId' });
        sessions.belongsTo(models.parliamentaryYears, { foreignKey: 'fkParliamentaryYearId'})
        // sessions.hasMany(models.manageSessions);
    };


    return sessions;
};