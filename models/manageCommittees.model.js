module.exports = (sequelize, Sequelize) => {
    const manageCommittees = sequelize.define("manageCommittees", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        committeeName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        committeeType: {
            type: Sequelize.ENUM("Sub Committees", "Mediation Committees", "Functional Committees", "Standing Committees", "Committee on Rules of Procedure and Privileges", "Mediation", "Special Committee"),
            allowNull: false
        },
        fromationDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        committeeStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return manageCommittees;
};