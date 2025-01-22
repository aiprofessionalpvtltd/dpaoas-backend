'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('financeMoneyBills', {
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
        type: Sequelize.ENUM("Amendment Bill", "Constitutional Amendment Bill", "Finance Bill", "Money Bill", "New Bill"),
        allowNull: false,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('financeMoneyBills');
  }
};