module.exports = (sequelize, Sequelize) => {
    const RolesUsers = sequelize.define("users_roles", {
        user_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users', // This should match the name of the "users" table
              key: 'id'
            }
          },
          role_id: {
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