module.exports = (sequelize, Sequelize) => {
    const SpeechOnDemands = sequelize.define("speechOnDemands", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        justification: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        fullSession: {
            type: Sequelize.STRING,
            allowNull: true
        },
        fkSessionNo: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        date_to: {
            type: Sequelize.STRING,
            allowNull: true
        },
        date_from: {
            type: Sequelize.STRING,
            allowNull: true
        },
        whatsapp_number: {
            type: Sequelize.STRING,
            allowNull: true
        },
        delivery_on: {
            type: Sequelize.STRING,
            allowNull: true
        },
        is_certified: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        isActive: {
            type: Sequelize.ENUM("Waiting For Approval", "Request In Process", "Delivered"),
            defaultValue: "Waiting For Approval",
        },

        deliveryDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },

        isEditable: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
        },

        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    SpeechOnDemands.associate = function (models) {
        SpeechOnDemands.belongsTo(models.sessions, { foreignKey: 'fkSessionNo', as: 'session' });
    };

    return SpeechOnDemands;
};