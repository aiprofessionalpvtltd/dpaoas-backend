module.exports = (sequelize, Sequelize) => {
    const FinanceMoneyBill = sequelize.define("financeMoneyBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenures',
                key: 'id'
            }
        },
        fkMinisterTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenuresMinisters',
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
        fkMnaParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'parliamentaryYearsMna',
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
            type: Sequelize.ENUM("Finance Bill", "Money Bill"),
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
        billStatus: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        billFrom: {
            type: Sequelize.ENUM("From Senate", "From NA"),
            allowNull: false,
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
            allowNull: false,
             defaultValue: 'Senators'
        },
        financeMoneyBillSentStatus: {
            type: Sequelize.ENUM("inLegislation", "toTranslation"),
            defaultValue: "inLegislation",
        },

        // New added
        dateOfCirculationOfNotice: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateofReciptofNotice: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateofReferencetoStandingCommittee: {
            type: Sequelize.DATE,
            allowNull: true
        },

        dateOfReturnByPresident: {
            type: Sequelize.DATE,
            allowNull: true
        },
        passedInJointSitting: {
            type: Sequelize.DATE,
            allowNull: true
        },
        isTranslated: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: true,
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    FinanceMoneyBill.associate = function (models) {
        FinanceMoneyBill.belongsTo(models.parliamentaryYears, { foreignKey: 'fkParliamentaryYearId', as: 'parliamentaryYear' });
        FinanceMoneyBill.belongsTo(models.parliamentaryYearsMna, { foreignKey: 'fkMnaParliamentaryYearId', as: 'mnaParliamentaryYears' });
        FinanceMoneyBill.belongsTo(models.billStatuses, { foreignKey: 'fkBillStatus', as: 'billStatuses' });
        FinanceMoneyBill.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessions' });
        FinanceMoneyBill.hasOne(models.introducedInHouses, { foreignKey: 'fkFinanceMoneyHouseId', as: 'introducedInHouses' });
        FinanceMoneyBill.hasOne(models.memberPassages, { foreignKey: 'fkFinanceMemberPassageId', as: 'memberPassagesFinance' });
        FinanceMoneyBill.hasMany(models.billDocuments, { foreignKey: 'fkBillDocumentId', as: 'billDocuments' });
        FinanceMoneyBill.belongsTo(models.users, { foreignKey: 'fkUserId', as: 'user' });
        FinanceMoneyBill.hasMany(models.senateBillSenatorMovers, { foreignKey: 'fkFinanceMoneyBillId', as: 'financeMoneyBillSenatorMovers' });
        FinanceMoneyBill.hasMany(models.senateBillMinistryMovers, { foreignKey: 'fkFinanceMoneyBillId', as: 'financeMoneyBillMinistryMovers' });
        FinanceMoneyBill.hasMany(models.senateBillMnaMovers, { foreignKey: 'fkFinanceMoneyBillId', as: 'financeMoneyBillMnaMovers' });

        FinanceMoneyBill.hasMany(models.translationRemarks, { 
            as: "translationRemarks", 
            foreignKey: "fkFinanceMoneyBillId" 
        });
    };

    return FinanceMoneyBill;
};