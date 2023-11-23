const jwt = require('jsonwebtoken');
const db = require("../models");
module.exports = (sequelize, Sequelize) => {
  const users = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNo: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    gender: {
      type: Sequelize.ENUM("male", "female"),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("active", "inactive", "locked"),
      defaultValue: 'active',
      allowNull: false
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 3, // Set the number of login attempts
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  users.associate = function (models) {
    // Associations to link applicant with form data collected during sign up
    users.hasMany(models.requestLeaves, { foreignKey: 'fkUserId', as: 'requestLeaves' });
    users.hasMany(models.leaveComments, { foreignKey: 'commentedBy', as: 'leaveComments' });

    // users.hasMany(models.requestLeaves, { foreignKey: 'fkUserId', as: 'requestLeaves' });
  };

  return users;
};
