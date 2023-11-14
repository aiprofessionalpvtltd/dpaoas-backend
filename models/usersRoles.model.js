module.exports = (sequelize, Sequelize) => {
    const RolesUsers = sequelize.define("usersRoles", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users', // This should match the name of the "users" table
              key: 'id'
            }
          },
          roleId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'roles', // This should match the name of the "roles" table
              key: 'id'
            }
          },
          createdAt: Sequelize.DATE, 
          updatedAt: Sequelize.DATE,
        });
  
    return RolesUsers;
  };