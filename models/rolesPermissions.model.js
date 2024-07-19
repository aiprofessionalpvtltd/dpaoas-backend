module.exports = (sequelize, Sequelize) => {
    const RolesPermissions = sequelize.define("rolesPermissions", {
  
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
  
    return RolesPermissions;
  };