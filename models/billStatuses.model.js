module.exports = (sequelize, Sequelize) => {
    const billStatuses = sequelize.define("billStatuses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        billStatusName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        billStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return billStatuses;
};