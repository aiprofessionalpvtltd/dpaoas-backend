module.exports = (sequelize, Sequelize) => {
    const Departments = sequelize.define("departments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      description: {
        type: Sequelize.STRING,
        allowNull:true
      },
      departmentDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      departmentStatus : {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: 'active'
      },
      createdAt: Sequelize.DATE, 
      updatedAt: Sequelize.DATE,
    });
  
    return Departments;
  };