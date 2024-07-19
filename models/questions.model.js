module.exports = (sequelize, Sequelize) => {
    const questions = sequelize.define("questions", {
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


        questionCategory: {
            type: Sequelize.ENUM("Starred", "Un-Starred", "Short Notice"),
            allowNull: false
        },



        fkQuestionStatus: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'questionStatuses',
                key: 'id'
            }
        },


        fkNoticeDiary: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'noticeOfficeDairies',
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

        questionImage: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true
        },

        englishText: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        urduText: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        fkDivisionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'divisions',
                key: 'id'
            }
        },

        fkQuestionDiaryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questionDiaries',
                key: 'id'
            }
        },

        fileStatus: {
            type: Sequelize.ENUM("Available", "Missing", "Moved For Approval", "Moved for Advance Copy"),
            allowNull: true,
        },

        fkGroupId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'groups',
                key: 'id'
            }
        },

        replyDate: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        originalText: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        ammendedText: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        replyQuestion: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        sentForTranslation: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },

        isTranslated: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },

        isDefered: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },

        isRevived: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },

        questionActive: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: false,
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

        questionSentStatus: {
            type: Sequelize.ENUM("toNotice", "fromNotice"),
            allowNull: false,
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questions.associate = function (models) {
        questions.belongsTo(models.sessions, { foreignKey: 'fkSessionId' });
        questions.belongsTo(models.questionStatuses, { foreignKey: 'fkQuestionStatus' })
        questions.belongsTo(models.questionDiaries, { foreignKey: 'fkQuestionDiaryId' })
        questions.belongsTo(models.members, { foreignKey: 'fkMemberId' });
        questions.belongsTo(models.noticeOfficeDairies, { foreignKey: 'fkNoticeDiary' });
        questions.belongsTo(models.divisions, { foreignKey: 'fkDivisionId' })
        questions.belongsTo(models.groups, { foreignKey: 'fkGroupId' })
        questions.belongsTo(models.users, { foreignKey: 'createdByUser' })
        questions.belongsTo(models.branches, { foreignKey: 'initiatedByBranch' })
        questions.belongsTo(models.branches, { foreignKey: 'sentToBranch' })
        questions.hasMany(models.questionRevivals, { as: 'questionRevival', foreignKey: 'fkQuestionId' })
        questions.hasMany(models.questionStatusHistories, { foreignKey: 'fkQuestionId' });
    };

    return questions;
};