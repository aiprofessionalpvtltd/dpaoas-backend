module.exports = (sequelize, Sequelize) => {
    const branchHierarchies = sequelize.define("branchHierarchies", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      branchName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      
      branchHierarchy: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },

      lowerLevelHierarchy: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },

      higherLevelHierarchy: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },
  
      branchHierarchyStatus: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: 'active'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
    
      return branchHierarchies;
      
    };