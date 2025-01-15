'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parliamentaryYearsMna', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parliamentaryTenure: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fkTenureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
      fromDate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      toDate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM("active","inactive"),
        defaultValue: "active",
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
    await queryInterface.dropTable('parliamentaryYearsMna');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_parliamentaryYearsMna_status;');
  }
};
