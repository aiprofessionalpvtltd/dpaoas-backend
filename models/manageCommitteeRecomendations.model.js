module.exports = (sequelize, Sequelize) => {
    const manageCommitteeRecomendations = sequelize.define("manageCommitteeRecomendations", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        committeeRecomendation: {
            type: Sequelize.STRING,
            allowNull: false
        },
        committeeStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return manageCommitteeRecomendations;
};