module.exports = (sequelize, Sequelize) => {
    const complaintTypes = sequelize.define("complaintTypes", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },


        complaintTypeName: {
            type: Sequelize.STRING,
            allowNull: false,

        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    return complaintTypes;
};