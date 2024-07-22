module.exports = (sequelize, Sequelize) => {
    const supplementaryLists = sequelize.define("supplementaryLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },


        fkQuestionListId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'questionLists',
                key: 'id'
            }
        },

        listName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        houseLayDate: {
            type: Sequelize.STRING,
            allowNull: false
        },



        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            // references: {
            //     model: 'user',
            //     key: 'id'
            // }
        },

        supplementaryListStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },
        
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,

    });

    supplementaryLists.associate = function (models) {
        supplementaryLists.belongsTo(models.questionLists, { foreignKey: 'fkQuestionListId' });
        supplementaryLists.belongsToMany(models.questions, { 
            through: 'questionSupplementaryList', 
            foreignKey: 'fkSupplementaryListId' ,
            otherKey: 'fkQuestionId'
          });

    };

    return supplementaryLists;
};