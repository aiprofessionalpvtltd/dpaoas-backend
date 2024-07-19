module.exports = (sequelize, Sequelize) => {
    const PrivateMemberBills = sequelize.define("privateMemberBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        SerialNo: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        fileNo: {
            type: Sequelize.STRING,
            allowNull: false
        },
        date: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fromReceived: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        briefSubject: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        remarks: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fkBranchesId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    PrivateMemberBills.associate = function (models) {
        PrivateMemberBills.belongsTo(models.branches, {foreignKey: 'fkBranchesId', as: 'branch'});
      };

    

    return PrivateMemberBills;
};