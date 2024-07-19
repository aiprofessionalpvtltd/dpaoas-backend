module.exports = (sequelize, Sequelize) => {
    const IntroducedInSenateBill = sequelize.define("introducedInSenateBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'parliamentaryYears',
                key: 'id'
            }
        },
        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        fkBillStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'billStatuses',
                key: 'id'
            }
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        billStatusDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        billRemarks: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        fileNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        noticeDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        billCategory: {
            type: Sequelize.ENUM("Government Bill", "Private Member Bill"),
            allowNull: false,
        },
        billType: {
            type: Sequelize.ENUM("Amendment Bill", "Constitutional Amendment Bill", "Finance Bill", "Money Bill", "New Bill"),
            allowNull: false,
        },
        PassedByNADate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        DateOfReceiptOfMessageFromNA:{
            type: Sequelize.DATE,
            allowNull: true
        },
        billTitle: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        billText: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        dateOfPassageBySenate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfTransmissionToNA: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfReceiptMessageFromNA: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfPublishInGazette: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfAssentByThePresident: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfPassageByNA: {
            type: Sequelize.DATE,
            allowNull: true
        },
        billStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        billFrom: {
            type: Sequelize.ENUM("From Senate", "From NA"),
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    IntroducedInSenateBill.associate = function (models) {
        IntroducedInSenateBill.belongsTo(models.parliamentaryYears, { foreignKey: 'fkParliamentaryYearId', as: 'parliamentaryYears' });
        IntroducedInSenateBill.belongsTo(models.billStatuses, { foreignKey: 'fkBillStatus', as: 'billStatuses' });
        IntroducedInSenateBill.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessions' });
        IntroducedInSenateBill.hasMany(models.senateBillSenatorMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillSenatorMovers' });
        IntroducedInSenateBill.hasMany(models.senateBillMinistryMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMinistryMovers' });
        IntroducedInSenateBill.hasMany(models.senateBillMnaMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMnaMovers' });
        IntroducedInSenateBill.hasOne(models.introducedInHouses, { foreignKey: 'fkIntroducedInHouseId', as: 'introducedInHouses' });
        IntroducedInSenateBill.hasOne(models.memberPassages, { foreignKey: 'fkMemberPassageId', as: 'memberPassages' });
        IntroducedInSenateBill.hasOne(models.billDocuments, { foreignKey: 'fkBillDocumentId', as: 'billDocuments' });
        IntroducedInSenateBill.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
    };

    return IntroducedInSenateBill;
};