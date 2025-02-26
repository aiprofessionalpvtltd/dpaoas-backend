module.exports = (sequelize, Sequelize) => {
    const LegisOrderOfDay = sequelize.define("legisOrderOfDay", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        sittingId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        sittingDate: {
            type: Sequelize.STRING, // Accepting as a string
            allowNull: false
        },
        sittingTime: {
            type: Sequelize.STRING, // Accepting as a string
            allowNull: false
        },
        isMonday: {
            type: Sequelize.BOOLEAN, // Accepting as a string
            allowNull: false
        },
        sentStatus: {
            type: Sequelize.ENUM("inLegislation", "toTranslation"),
            defaultValue: "inLegislation",
        },
        content: {
            type: Sequelize.JSON, // Changed from STRING to JSON
            allowNull: false
        }
    });

    LegisOrderOfDay.associate = function(models) {
        LegisOrderOfDay.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'session' });
    };

    return LegisOrderOfDay;
};