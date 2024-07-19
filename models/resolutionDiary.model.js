module.exports = (sequelize, Sequelize) => {
    const resolutionDiaries = sequelize.define("resolutionDiaries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        resolutionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        resolutionDiaryNo: {
            type: Sequelize.INTEGER,
            allowNull: true
        },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return resolutionDiaries;
};