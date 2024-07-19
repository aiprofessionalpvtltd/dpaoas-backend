module.exports = (sequelize, Sequelize) => {
    const leaveTypes = sequelize.define("leaveTypes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      leaveType: {
        type: Sequelize.STRING,
        allowNull:false
      },

      fkRoleId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'roles', 
          key: 'id'
        }
      },
      leavesCount: {
        type: Sequelize.STRING,
        allowNull:true
      }, 
      leaveStatus :{
        type: Sequelize.STRING,
        allowNull:true
      },
     
      createdAt: Sequelize.DATE, 
      updatedAt: Sequelize.DATE,
    });
  
    return leaveTypes;
  };