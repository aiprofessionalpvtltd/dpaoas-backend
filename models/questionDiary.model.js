module.exports = (sequelize, Sequelize) => {
    const questionDiaries = sequelize.define("questionDiaries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        questionID: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        questionDiaryNo: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        // fkSessionId: {
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: 'sessions',
        //         key: 'id'
        //     }
        // },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    return questionDiaries;
};