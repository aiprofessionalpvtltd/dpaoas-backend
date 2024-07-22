module.exports = (sequelize, Sequelize) => {
    const complaintCategories = sequelize.define("complaintCategories", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        complaintCategoryName: {
            type: Sequelize.STRING,
            allowNull: false,
    
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    return complaintCategories;
};