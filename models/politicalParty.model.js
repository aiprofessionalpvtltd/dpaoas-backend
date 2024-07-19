

module.exports = (sequelize, Sequelize) => {
    const politicalParties = sequelize.define("politicalParties", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        partyName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        shortName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true

        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    //   requestLeaves.associate = function (models) {
    //     requestLeaves.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'users' });
    //     requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
    //     requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
    //   };
    return politicalParties;
};