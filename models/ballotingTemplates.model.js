module.exports = (sequelize, Sequelize) => {
    const ballotingTemplates = sequelize.define("ballotingTemplates", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        templateUserName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        templateUserRole: {
            type: Sequelize.STRING,
            allowNull: false
        },
        templateDescription: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        ballotingFileNo: {
            type: Sequelize.STRING,
            allowNull: false
        },
        ballotingDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        ballotingOrderDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        templateStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return ballotingTemplates;
};