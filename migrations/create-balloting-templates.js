'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ballotingTemplates', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      templateUserName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      templateUserRole: {
        type: Sequelize.STRING,
        allowNull: false
      },
      templateDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      templateStatus: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: 'active'
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
    await queryInterface.dropTable('ballotingTemplates');
  }
};
