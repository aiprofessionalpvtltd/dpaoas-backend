module.exports = (sequelize, Sequelize) => {
    const groupsDivisions = sequelize.define("groupsDivisions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    
        fkDivisionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'divisions',
                key: 'id'
            }
        },

        fkGroupId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'groups',
                key: 'id'
            }
        },

        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    groupsDivisions.associate = function(models) {
        groupsDivisions.belongsTo(models.divisions, { foreignKey: 'fkDivisionId'});
        groupsDivisions.belongsTo(models.groups , { foreignKey: 'fkGroupId'});
        groupsDivisions.belongsTo(models.sessions , { foreignKey: 'fkSessionId'})
    };

    return groupsDivisions;
};