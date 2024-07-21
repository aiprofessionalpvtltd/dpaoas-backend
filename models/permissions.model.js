module.exports = (sequelize, Sequelize) => {
  const Permissions = sequelize.define("permissions", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false
    },

    fkModuleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'modules',
        key: 'id'
      }
    },
    permissionStatus: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: 'active'
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  Permissions.associate = function (models) {
    Permissions.belongsToMany(models.roles, { as: 'roles', through: 'rolesPermissions', foreignKey: 'permissionId' });
    Permissions.belongsTo(models.rolesPermissions, { as: 'permissions', through: 'rolesPermissions', foreignKey: 'permissionId' })
    Permissions.belongsTo(models.modules, { as: 'modules', foreignKey: 'fkModuleId' });
  };

  return Permissions;
};
