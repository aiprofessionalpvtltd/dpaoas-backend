module.exports = (sequelize, Sequelize) => {
    const questionDefers = sequelize.define("questionDefers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkQuestionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'questions',
                key: 'id'
            }
        },
        
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        deferredDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        deferredBy : {
            type: Sequelize.STRING,
            allowNull: false
        },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questionDefers.associate = function(models) {
        questionDefers.belongsTo(models.questions, { foreignKey: 'fkQuestionId'})
        questionDefers.belongsTo(models.sessions, { foreignKey: 'fkSessionId'});
    }


    return questionDefers;
};