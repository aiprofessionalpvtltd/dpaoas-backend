module.exports = (sequelize, Sequelize) => {
    const questionStatuses = sequelize.define("questionStatuses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // fkSessionId:{
        //     type: Sequelize.INTEGER,
        //     allowNull: false,
        //     references: {
        //         model: 'sessions',
        //         key: 'id'
        //     }
        // },
        questionStatus: {
            type: Sequelize.STRING,
            allowNull: false
        
        },
        questionActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return questionStatuses;
};