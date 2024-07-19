module.exports = (sequelize, Sequelize) => {
    const ministries = sequelize.define("ministries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        ministryName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ministryStatus: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return ministries;
};