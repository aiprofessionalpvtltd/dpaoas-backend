module.exports = (sequelize, Sequelize) => {
    const billDocuments = sequelize.define("billDocuments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkBillDocumentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'introducedInSenateBills',
                key: 'id'
            }
        },
        documentType: {
            type: Sequelize.ENUM("Ammendment", "Bill", "Committee Report", "Gazette", "Letter Sent to Senator", "Member Notice for Passage", "Member Notice for Withdrawal", "Notice", "Proforma"),
            allowNull: true,
        },
        documentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        documentDiscription: {
            type: Sequelize.STRING,
            allowNull: true
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    billDocuments.associate = function (models) {
        billDocuments.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkBillDocumentId', as: 'introducedInSenateBills' });
    };

    return billDocuments;
};