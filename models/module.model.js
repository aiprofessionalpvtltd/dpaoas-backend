module.exports = (sequelize, Sequelize) => {
  const Modules = sequelize.define("modules", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: Sequelize.STRING, 
      allowNull: false
    },

    moduleStatus: {
      type: Sequelize.ENUM("active","inactive"),
      defaultValue: 'active',
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return Modules;
};