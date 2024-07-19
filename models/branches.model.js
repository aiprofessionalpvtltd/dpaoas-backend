module.exports = (sequelize, Sequelize) => {
    const branches = sequelize.define("branches", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      branchName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
  
      branchStatus: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: 'active'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
  
      // Departments.associate = function (models) {
      //   Departments.hasMany(models.users, { foreignKey: 'fkDepartmentId', as: 'users' });
      // };
    
      return branches;
      
    };