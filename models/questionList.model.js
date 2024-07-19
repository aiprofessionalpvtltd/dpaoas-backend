module.exports = (sequelize, Sequelize) => {
    const questionLists = sequelize.define("questionLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        questionCategory: {
            type: Sequelize.ENUM("Starred", "Un-Starred", "Short Notice"),
            allowNull: false
        },

        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        fkGroupId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'groups',
                key: 'id'
            }
        },

        startListNo: {
            type: Sequelize.INTEGER,
            allowNull: false
        },

        listName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        houseLayDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        defferedQuestions: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },

        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            // references: {
            //     model: 'user',
            //     key: 'id'
            // }
        },

        questionListStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },
        
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,

    });

    questionLists.associate = function (models) {
        questionLists.belongsTo(models.sessions, { foreignKey: 'fkSessionId' });
        questionLists.belongsTo(models.groups, { foreignKey: 'fkGroupId' });
        questionLists.belongsToMany(models.questions, { 
            through: 'questionQuestionList', 
            foreignKey: 'fkQuestionListId' ,
            otherKey: 'fkQuestionId'
          });

    };

    return questionLists;
};