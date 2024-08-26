module.exports = (sequelize, Sequelize) => {
    const OrdinanceDocuments = sequelize.define("ordinanceDocuments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkOrdinanceId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'ordinances',
                key: 'id'
            }
        },
        documentType: {
            type: Sequelize.ENUM("Ordinance"),
            allowNull: true,
        },
        documentDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        documentDescription: { // Corrected the typo from "document Discription"
            type: Sequelize.STRING,
            allowNull: true,
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        createdAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
        },
    });

    // Define the association with the ordinances model
    OrdinanceDocuments.associate = function (models) {
        OrdinanceDocuments.belongsTo(models.Ordinances, { foreignKey: 'fkOrdinanceId', as: 'ordinance' });
    };

    return OrdinanceDocuments;
};
