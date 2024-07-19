module.exports = (sequelize, Sequelize) => {
    const ModulesPermissions = sequelize.define("modulesPermissions", {
  
        moduleId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'modules', // This should match the name of the "users" table
              key: 'id'
            }
          },
          permissionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'permissions', // This should match the name of the "roles" table
              key: 'id'
            }
          },
          createdAt: Sequelize.DATE, 
          updatedAt: Sequelize.DATE,
        });
  
    return ModulesPermissions;
  };