module.exports = (sequelize, Sequelize) => {
  const Passes = sequelize.define("passes", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    passDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    requestedBy: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    branch: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    visitPurpose: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    cardType: {
      type: Sequelize.STRING,
      allowNull: true
    },

    companyName: {
      type: Sequelize.STRING,
      allowNull: true
    },

    fromDate: {
      type: Sequelize.STRING,
      allowNull: false
    },

    toDate: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    allowOffDays: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },

    remarks: {
      type: Sequelize.STRING,
      allowNull: true
    },

    passStatus: {
      type: Sequelize.STRING,
      allowNull: true
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return Passes;
};