const db = require(".");

module.exports = (sequelize, Sequelize) => {
    const years = sequelize.define("years", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        year: {
            type: Sequelize.STRING,
            allowNull: false
        },
        
        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"

        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    
    return years;
};