module.exports = (sequelize, Sequelize) => {
    const questionDefers = sequelize.define("questionDefers", {
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
        
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        deferredDate: {
            type: Sequelize.DATE,
            allowNull: false
        },

        deferredBy : {
            // type: Sequelize.STRING,
            // allowNull: false
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

    questionDefers.associate = function(models) {
        questionDefers.belongsTo(models.questions, { foreignKey: 'fkQuestionId', as: 'deferQuestion'})
        questionDefers.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'deferredSession'});
        questionDefers.belongsTo(models.users , {foreignKey: 'deferredBy', as: 'deferredByUser'})
    }


    return questionDefers;
};