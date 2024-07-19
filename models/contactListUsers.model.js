module.exports = (sequelize, Sequelize) => {
    const ContactListUsers = sequelize.define("contactListUsers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkListId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'contactLists',
                key: 'id'
            }
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ContactListUsers.associate = function (models) {
        ContactListUsers.belongsTo(models.members, { foreignKey: 'fkMemberId', as: 'member' });
    };

    return ContactListUsers;
};