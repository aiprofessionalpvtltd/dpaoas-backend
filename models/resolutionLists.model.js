module.exports = (sequelize, Sequelize) => {
    const resolutionLists = sequelize.define("resolutionLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        listName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        listDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        resolutionListStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },
        
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,

    });

    resolutionLists.associate = function (models) {
        resolutionLists.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessionName' });
        resolutionLists.belongsToMany(models.resolutions, {
            through: 'resolutionResolutionLists',
            foreignKey: 'fkResolutionListId',
            otherKey: 'fkResolutionId',
            as: 'resolutions'
          });

    };

    return resolutionLists;
};