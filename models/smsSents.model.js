module.exports = (sequelize, Sequelize) => {
    const SmsSents = sequelize.define("smsSents", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        msgText: {
            type: Sequelize.STRING,
            allowNull: false
        },
        RecieverNo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        fkListId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'contactLists',
                key: 'id'
            }
        },
        isSent: {
            type: Sequelize.STRING,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SmsSents.associate = function (models) {
      SmsSents.belongsTo(models.contactLists, { foreignKey: 'fkListId', as: 'contactList' });
    };

    return SmsSents;
};