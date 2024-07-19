module.exports = (sequelize, Sequelize) => {
  const RolesPermissions = sequelize.define("rolesPermissions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
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

  RolesPermissions.associate = function (models) {
    RolesPermissions.belongsTo(models.roles, { as: 'roles', foreignKey: 'roleId' });
    RolesPermissions.belongsTo(models.permissions, { as: 'permissions', foreignKey: 'permissionId' });


  };


  return RolesPermissions;
};