module.exports = (sequelize, Sequelize) => {
    const questionFiles = sequelize.define("questionFiles", {
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
        
        fileStatus: {
            type: Sequelize.STRING,
            allowNull: false
        },

        fileStatusDate: {
            type: Sequelize.STRING,
            allowNull: false
        },
     

        // fkUserId : {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        //     references : {
        //         model: 'users',
        //         key: 'id'
        //     }
        // },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    questionFiles.associate = function(models) {
        questionFiles.belongsTo(models.questions, { foreignKey: 'fkQuestionId'});
    }

    return questionFiles;
};