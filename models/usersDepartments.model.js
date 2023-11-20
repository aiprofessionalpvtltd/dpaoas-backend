module.exports = (sequelize, Sequelize) => {
    const UsersDepartments = sequelize.define("usersDepartments", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users',
              key: 'id'
            }
          },
          departmentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'departments',
              key: 'id'
            }
          },
          createdAt: Sequelize.DATE, 
          updatedAt: Sequelize.DATE,
        });
  
    return UsersDepartments;
  };