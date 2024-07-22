module.exports = (sequelize, Sequelize) => {
    const questionStatusHistories = sequelize.define("questionStatusHistories", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkQuestionId:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questions',
                key: 'id'
            }
        },
        fkSessionId:{
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
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
        questionStatusDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questionStatusHistories.associate = function(models) {
        questionStatusHistories.belongsTo(models.sessions, { foreignKey: 'fkSessionId'});
        questionStatusHistories.belongsTo(models.questionStatuses, { foreignKey: 'fkQuestionStatus'});

    }

    return questionStatusHistories;
};