module.exports = (sequelize, Sequelize) => {
    const questionQuestionLists = sequelize.define("questionQuestionLists", {
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
        fkQuestionListId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questionLists',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questionQuestionLists.associate = function (models) {
        questionQuestionLists.belongsTo(models.questionLists, { foreignKey: 'fkQuestionListId' });
        questionQuestionLists.belongsTo(models.questions, { foreignKey: 'fkQuestionId' });
    };

    return questionQuestionLists;
};