module.exports = (sequelize, Sequelize) => {
    const Modules = sequelize.define("modules", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      
      name: {
        type: Sequelize.STRING, // Define an array of strings
        allowNull: false
      },
      createdAt: Sequelize.DATE, 
      updatedAt: Sequelize.DATE,
    });
  
    return Modules;
  };