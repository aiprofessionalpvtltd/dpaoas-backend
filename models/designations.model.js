module.exports = (sequelize, Sequelize) => {
  const Designations = sequelize.define("designations", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    designationName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    designationStatus: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: 'active'
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return Designations;
};
