module.exports = (sequelize, Sequelize) => {
    const LegisOrderOfDay = sequelize.define("legisOrderOfDay", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        sittingDate: {
            type: Sequelize.STRING,
            allowNull: false
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        }
    });

    LegisOrderOfDay.associate = function(models) {
        LegisOrderOfDay.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'session' });
    };

    return LegisOrderOfDay;
};
