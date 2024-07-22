module.exports = (sequelize, Sequelize) => {
    const ContactTemplates = sequelize.define("contactTemplates", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        templateName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        msgText: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    ContactTemplates.associate = function (models) {
        ContactTemplates.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
    };

    return ContactTemplates;
};