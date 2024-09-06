module.exports = (sequelize, Sequelize) => {
    const groups = sequelize.define("groups", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupNameStarred: {
            type: Sequelize.STRING,
            allowNull: false
        },
        groupNameUnstarred: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
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

    groups.associate = function (models) {
        // Many-to-Many association between groups and divisions through groupsDivisions
        // groups.belongsToMany(models.divisions, {
        //     through: 'groupsDivisionsBridge', // Junction table
        //     foreignKey: 'fkGroupId',
        //     otherKey: 'fkDivisionId',
        //     as: 'divisions' // Alias used in eager loading
        // });

        // groups.hasMany(models.members, { foreignKey: 'fkGroupId', as: 'members' });

        // Many-to-many relationship with divisions through groupsDivisions
        groups.belongsToMany(models.divisions, {
            through: models.groupsDivisions,
            foreignKey: 'fkGroupId',
            otherKey: 'fkDivisionId',
            as: 'divisionAssociations'
        });
    };


    return groups;
};