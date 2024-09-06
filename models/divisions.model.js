module.exports = (sequelize, Sequelize) => {
    const divisions = sequelize.define("divisions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        divisionName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },
        divisionStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    divisions.associate = function (models) {
        divisions.belongsTo(models.ministries, { foreignKey: 'fkMinistryId' });
        // Many-to-Many association between divisions and groups through groupsDivisions
        // divisions.belongsToMany(models.groups, {
        //     through: 'groupsDivisionsData', // Junction table
        //     foreignKey: 'fkDivisionId',
        //     otherKey: 'fkGroupId',
        //     as: 'groups' // Alias used if loading groups through divisions
        // });

        // divisions.hasMany(models.members, { foreignKey: 'fkDivisionId', as: 'members' });

        // Many-to-many relationship with groups through groupsDivisions
        divisions.belongsToMany(models.groups, {
            through: models.groupsDivisions,
            foreignKey: 'fkDivisionId',
            otherKey: 'fkGroupId',
            as: 'groupAssociations'
        });
    };


    return divisions;
};