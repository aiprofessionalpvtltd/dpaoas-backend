module.exports = (sequelize, Sequelize) => {
  const Roles = sequelize.define("roles", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    roleStatus: {
      type: Sequelize.ENUM("active", "inactive"),
      defaultValue: 'active'
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  Roles.associate = function(models) {
    Roles.belongsToMany(models.permissions, { as: 'permissions', through: 'rolesPermissions', foreignKey: 'roleId' });

  };

  return Roles;
};