module.exports = (sequelize, Sequelize) => {
    const ContactLists = sequelize.define("contactLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        listName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        listDescription: {
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
        isPublicList: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        listActive: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ContactLists.associate = function (models) {
        ContactLists.hasMany(models.contactListUsers, { foreignKey: 'fkListId', as: 'contactMembers' });
        ContactLists.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
      };

    return ContactLists;
};