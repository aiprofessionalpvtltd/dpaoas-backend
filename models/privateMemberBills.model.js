module.exports = (sequelize, Sequelize) => {
    const PrivateMemberBills = sequelize.define("privateMemberBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        SerialNo: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        fileNo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        date: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fromReceived: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        briefSubject: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        remarks: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        fkBranchesId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        proposed_time: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        draft_type: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkBillStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1,
            references: {
                model: 'billStatuses',
                key: 'id'
            }
        },
        billSentStatus: {
            type: Sequelize.ENUM("inNotice", "toLegislation"),
            defaultValue: 'inNotice'
        },

        billSentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        device: {
            type: Sequelize.STRING,
            defaultValue: 'web',
            allowNull: true,
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    PrivateMemberBills.associate = function (models) {
        PrivateMemberBills.belongsTo(models.branches, {foreignKey: 'fkBranchesId', as: 'branch'});
        PrivateMemberBills.belongsTo(models.billStatuses, { foreignKey: 'fkBillStatus', as: 'billStatuses' });
      };

    

    return PrivateMemberBills;
};