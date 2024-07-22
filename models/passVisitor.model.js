module.exports = (sequelize, Sequelize) => {
  const PassVisitor = sequelize.define("passVisitors", {
    passId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'passes',
        key: 'id'
      }
    },
    visitorId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'visitors',
        key: 'id'
      }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return PassVisitor;
};