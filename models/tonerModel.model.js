module.exports = (sequelize, Sequelize) => {
    const tonerModels = sequelize.define("tonerModels", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        tonerModel: {
            type: Sequelize.STRING,
            allowNull: false
        },

        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        quantity:{
            type: Sequelize.INTEGER,
            allowNull: true
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },
        
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    return tonerModels;
};