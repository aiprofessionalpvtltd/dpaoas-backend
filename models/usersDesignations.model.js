module.exports = (sequelize, Sequelize) => {
    const UsersDesignations = sequelize.define("usersDesignations", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            }
          },
          designationId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'designations',
              key: 'id'
            }
          },
          createdAt: Sequelize.DATE, 
          updatedAt: Sequelize.DATE,
        });
  
    return UsersDesignations;
  };