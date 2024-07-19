module.exports = (sequelize, Sequelize) => {
    const freshReceipts = sequelize.define("freshReceipts", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkUserBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },

        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        frType: {
            type: Sequelize.ENUM("Internal", "External"),
            allowNull: false
        },

        frSubject: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        referenceNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },

        frDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },

        shortDescription: {
            type: Sequelize.STRING,
            allowNull: true
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    freshReceipts.associate = function (models) {
        freshReceipts.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });
        freshReceipts.belongsTo(models.branches, { foreignKey: 'fkUserBranchId', as: 'userBranches' });

        freshReceipts.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
        freshReceipts.belongsTo(models.users, { foreignKey: 'createdBy', as: 'createdBy' });
        freshReceipts.hasMany(models.fileDiaries, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' })
        freshReceipts.hasMany(models.freshReceiptsAttachments, { foreignKey: 'fkFreshReceiptId', as: "freshReceiptsAttachments" })
    };
    return freshReceipts;

};