const db = require(".");

module.exports = (sequelize, Sequelize) => {
    const motions = sequelize.define("motions", {
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
        fileNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },
        motionType: {
            type: Sequelize.ENUM("Adjournment Motion", "Call Attention Notice", "Privilege Motion", "Laying of Copy", "Motion For Consideration/Discussion", "Motion Under Rule 194", "Motion Under Rule 218", "Motion Under Rule 60"),
            // defaultValue: 'pending'
        },
        motionWeek: {
            type: Sequelize.ENUM("Not Applicable", "1st Week", "2nd Week", "3rd Week", "4th Week", "5th Week"),
            // defaultValue: 'pending'
        },
        fkDairyNumber: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'noticeOfficeDairies',
                key: 'id'
            }
        },
        image: {
            type: Sequelize.STRING,
            allowNull: true
        },
        englishText: {
            type: Sequelize.STRING,
            allowNull: true
        },
        urduText: {
            type: Sequelize.STRING,
            allowNull: true
        },
        fkMotionStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motionStatuses',
                key: 'id'
            }
        },
        dateOfMovingHouse: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfDiscussion: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfReferringToSc: {
            type: Sequelize.DATE,
            allowNull: true
        },
        note: {
            type: Sequelize.STRING,
            allowNull: true
        },
        sentForTranslation: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        isTranslated: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true
        },

        createdByUser: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        initiatedByBranch: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        sentToBranch: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },


        motionSentStatus: {
            type: Sequelize.ENUM("toNotice", "fromNotice"),
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    motions.associate = function (models) {
        motions.hasMany(models.motionMovers, { foreignKey: 'fkMotionId', as: 'motionMovers' });
        motions.hasMany(models.motionMinistries, { foreignKey: 'fkMotionId', as: 'motionMinistries' });
        motions.hasMany(models.motionStatusHistories, { foreignKey: 'fkMotionId', as: 'motionStatusHistories' });
        motions.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessions' });
        motions.belongsTo(models.noticeOfficeDairies, { foreignKey: 'fkDairyNumber', as: 'noticeOfficeDairies' });
        motions.belongsTo(models.motionStatuses, { foreignKey: 'fkMotionStatus', as: 'motionStatuses' });
        motions.belongsTo(models.users, { foreignKey: 'createdByUser' })
        motions.belongsTo(models.branches, { foreignKey: 'initiatedByBranch' })
        motions.belongsTo(models.branches, { foreignKey: 'sentToBranch' })
        //     requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
        //     requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
    };
    return motions;
};