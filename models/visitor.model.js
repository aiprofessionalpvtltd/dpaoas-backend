module.exports = (sequelize, Sequelize) => {
  const Visitors = sequelize.define("visitors", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false
    },

    cnic: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    details: {
      type: Sequelize.STRING,
      allowNull: false
    },

    visitorStatus: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: 'active',
      allowNull: false
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return Visitors;
};