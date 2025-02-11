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
        fkLegisBillDocumentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'legislativeBills',
                key: 'id'
            }
        },
        documentType: {
            type: Sequelize.ENUM(
                'Notice Under Rule 94',
                'Notice Under Rule 96',
                'Notes',
                'Correspondence',
                'Bill (English)',
                'Bill (Urdu)',
                'Urdu Translation',
                'English Translation',
                'Original Act',
                'Letter Sent to Senator for Rectification',
                'Letter Sent to Concerned Ministry / Division',
                'Bill Introduced in the House',
                'Committee Report',
                'Notice for Consideration and Passage Under Rules 100 /113',
                'Notice for Withdrawal Under Rule 115',
                'Bill Passed by the House',
                'Message sent to NA',
                'Note For Gazette',
                'Gazette Publication',
                'Message From NA',
                'Letter circulated to Members/Ministries under rule 118',
                'Notice under rule 119',
                'Referred to Standing Committee',
                'Bill as introduced',
                'Report',
                'Bill as Reported',
                'Bill passed',
                'Message Transmitted to NA under rule 125',
                'Bill not Passed by senate with in 90 days',
                'Bill sent for assent',
                'Bill Returend by President',
                'Sent for Gazette',
                'Published in the Gazette',
                'Received from Senator'
            ),
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
        billDocuments.belongsTo(models.legislativeBills, { foreignKey: 'fkLegisBillDocumentId', as: 'legislativeBills' });
    };

    return billDocuments;
};