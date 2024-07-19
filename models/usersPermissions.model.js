module.exports = (sequelize, Sequelize) => {
  const UsersPermissions = sequelize.define("usersPermissions", {

    userId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    permissionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'permissions',
        key: 'id'
      }
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  return UsersPermissions;
};