module.exports = (sequelize, Sequelize) => {
    const filesNotifications = sequelize.define("filesNotifications", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkFileId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'newFiles',
                key: 'id'
            }
        },
        fkCaseId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'cases',
                key: 'id'
            }
        },

        fkFreshReceiptId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'freshReceipts',
                key: 'id'
            }
        },

        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        readStatus: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    filesNotifications.associate = function (models) {
        filesNotifications.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'users' });
        filesNotifications.belongsTo(models.newFiles, { foreignKey: 'fkFileId', as: 'files' });
        filesNotifications.belongsTo(models.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipt' });
        filesNotifications.belongsTo(models.cases, { foreignKey: 'fkCaseId', as: 'case' });

    };
    return filesNotifications;

};