module.exports = (sequelize, Sequelize) => {
    const resolutionStatuses = sequelize.define("resolutionStatuses", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        resolutionStatus: {
            type: Sequelize.STRING,
            allowNull: false
        },
        resolutionActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return resolutionStatuses;
};