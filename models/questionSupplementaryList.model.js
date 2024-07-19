module.exports = (sequelize, Sequelize) => {
    const questionSupplementaryLists = sequelize.define("questionSupplementaryLists", {
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
        fkSupplementaryListId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'supplementaryLists',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questionSupplementaryLists.associate = function (models) {
        questionSupplementaryLists.belongsTo(models.supplementaryLists, { foreignKey: 'fkSupplementaryListId' });
        questionSupplementaryLists.belongsTo(models.questions, { foreignKey: 'fkQuestionId' });
    };

    return questionSupplementaryLists;
};