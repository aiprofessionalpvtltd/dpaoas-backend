module.exports = (sequelize, Sequelize) => {
    const questionRevivals = sequelize.define("questionRevivals", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkQuestionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questions',
                key: 'id'
            }
        },
        
        fkFromSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        fkToSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }

        },

        fkGroupId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'groups',
                key: 'id'
            }
        },

        fkDivisionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'divisions',
                key: 'id'
            }
        },

        fkNoticeDiaryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'noticeOfficeDairies',
                key: 'id'
            }
        },

        fkQuestionStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questionStatuses',
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



        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,

    });

        questionRevivals.associate = function(models) {
        questionRevivals.belongsTo(models.questions, { foreignKey: 'fkQuestionId'})
        questionRevivals.belongsTo(models.sessions, { as:'FromSession', foreignKey: 'fkFromSessionId'});
        questionRevivals.belongsTo(models.sessions, { as: 'ToSession' ,foreignKey: 'fkToSessionId'});
        questionRevivals.belongsTo(models.questionStatuses, { foreignKey: 'fkQuestionStatus'})
        questionRevivals.belongsTo(models.questionDiaries , { foreignKey: 'fkQuestionDiaryId'})
        questionRevivals.belongsTo(models.noticeOfficeDairies, { foreignKey: 'fkNoticeDiaryId'});
        questionRevivals.belongsTo(models.divisions , { foreignKey: 'fkDivisionId'})
        questionRevivals.belongsTo(models.groups, {  foreignKey: 'fkGroupId' })

        // ... other associations ...
    };

    return questionRevivals;
};