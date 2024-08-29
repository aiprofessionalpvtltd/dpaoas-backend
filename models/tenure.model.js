

module.exports = (sequelize, Sequelize) => {
    const tenures = sequelize.define("tenures", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tenureName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fromDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        toDate: {
            type: Sequelize.DATE,
            allowNull: false

        },
        status: {
            type: Sequelize.STRING,
            allowNull: true

        },
        tenureType: {
            type: Sequelize.ENUM("Senators", "Ministers"),
            allowNull: false,
             defaultValue: 'Senators'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    //   requestLeaves.associate = function (models) {
    //     requestLeaves.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'users' });
    //     requestLeaves.belongsTo(models.users, {foreignKey: 'requestLeaveSubmittedTo',as: 'submittedToUser'});
    //     requestLeaves.hasMany(models.leaveComments, { foreignKey: 'fkRequestLeaveId', as: 'leaveComments' });
    //   };
    return tenures;
};