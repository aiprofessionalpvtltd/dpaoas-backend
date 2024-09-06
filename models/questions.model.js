module.exports = (sequelize, Sequelize) => {
    const questions = sequelize.define("questions", {
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


        questionCategory: {
            type: Sequelize.ENUM("Starred", "Un-Starred", "Short Notice"),
            allowNull: true
        },



        fkQuestionStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
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
            allowNull: true,
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
            allowNull: true,
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
            type: Sequelize.ENUM("inQuestion","toQuestion", "inNotice"),
            defaultValue: "inNotice",
        },

        questionSentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },

        device: {
            type: Sequelize.STRING,
            defaultValue: 'web',
            allowNull: true,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        submittedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        memberPosition: {
            type: Sequelize.ENUM("Treasury", "Opposition", "Independent", "Anyside"),
            allowNull: true,
        },

        deletedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questions.associate = function (models) {
        questions.belongsTo(models.sessions, { foreignKey: 'fkSessionId' });
        questions.belongsTo(models.questionStatuses, { foreignKey: 'fkQuestionStatus' })
        questions.belongsTo(models.questionDiaries, { foreignKey: 'fkQuestionDiaryId' })
        questions.belongsTo(models.members, { foreignKey: 'fkMemberId' });
        questions.belongsTo(models.noticeOfficeDairies, { foreignKey: 'fkNoticeDiary'});
        questions.belongsTo(models.divisions , { foreignKey: 'fkDivisionId'})
        questions.belongsTo(models.groups, {  foreignKey: 'fkGroupId' })
        questions.hasMany(models.questionRevivals, { as: 'questionRevival', foreignKey: 'fkQuestionId'})
        questions.hasMany(models.questionStatusHistories, { foreignKey: 'fkQuestionId'});
        questions.belongsTo(models.users , { foreignKey: 'deletedBy', as: 'questionDeletedBy'})
        questions.belongsTo(models.users , { foreignKey: 'submittedBy', as: 'questionSubmittedBy'})
        // questions.belongsTo(models.members, { foreignKey: 'fkMemberId', as: 'member' });


    };

    return questions;
};


