module.exports = (sequelize, Sequelize) => {
    const LegislativeBills = sequelize.define("legislativeBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
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
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        attachment: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        date: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkBillStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1,
            references: {
                model: 'billStatuses',
                key: 'id'
            }
        },
        device: {
            type: Sequelize.STRING,
            defaultValue: 'web',
            allowNull: true,
        },
        legislativeSentStatus: {
            type: Sequelize.ENUM("inNotice", "toLegislation"),
            defaultValue: 'inNotice'
        },
        legislativeSentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        isActive: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: true,
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        diary_number: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        noticeOfficeDiaryTime: {
            type: Sequelize.TIME,
            allowNull: true, 
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        // New fields added from introducedInSenateBills
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenures',
                key: 'id'
            }
        },
        fkTermId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'terms',
                key: 'id'
            }
        },
        fkParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'parliamentaryYears',
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
            allowNull: true
        },
        noticeDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        billCategory: {
            type: Sequelize.ENUM("Government Bill", "Private Member Bill"),
            allowNull: true,
        },
        billType: {
            type: Sequelize.ENUM("Amendment Bill", "Constitutional Amendment Bill", "Finance Bill", "Money Bill", "New Bill"),
            allowNull: true,
        },
        PassedByNADate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        DateOfReceiptOfMessageFromNA: {
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
        dateOfCirculationOfBill: {
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
        billFrom: {
            type: Sequelize.STRING,
            allowNull: true
        },
        dateOfJointSitting: {
            type: Sequelize.DATE,
            allowNull: true
        },
        actNo: {
            type: Sequelize.STRING,
            allowNull: true
        },
        billFor: {
            type: Sequelize.ENUM("Senators", "Ministers"),
            allowNull: true,
            defaultValue: 'Senators'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    LegislativeBills.associate = function (models) {
        LegislativeBills.belongsTo(models.sessions, { foreignKey: 'fkSessionNo', as: 'session' });
        LegislativeBills.belongsTo(models.billStatuses, { foreignKey: 'fkBillStatus', as: 'billStatuses' });
        LegislativeBills.belongsTo(models.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });
        LegislativeBills.hasMany(models.legislationMovers, { foreignKey: 'fklegislationBillId', as: 'legislationMovers' });
        // Associations copied from introducedInSenateBills
        LegislativeBills.belongsTo(models.parliamentaryYears, { foreignKey: 'fkParliamentaryYearId', as: 'parliamentaryYears' });
        LegislativeBills.hasMany(models.senateBillSenatorMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillSenatorMovers' });
        LegislativeBills.hasMany(models.senateBillMinistryMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMinistryMovers' });
        LegislativeBills.hasMany(models.senateBillMnaMovers, { foreignKey: 'fkIntroducedInSenateBillId', as: 'senateBillMnaMovers' });
        LegislativeBills.hasOne(models.introducedInHouses, { foreignKey: 'fkLegisIntroducedInHouseId', as: 'introducedInHousesLegis' });
        LegislativeBills.hasOne(models.memberPassages, { foreignKey: 'fkLegisMemberPassageId', as: 'memberPassagesLegis' });
        LegislativeBills.hasMany(models.billDocuments, { foreignKey: 'fkLegisBillDocumentId', as: 'billDocumentsLegis' });
        LegislativeBills.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
    };

    return LegislativeBills;
};