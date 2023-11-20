module.exports = (sequelize, Sequelize) => {
    const LeaveComments = sequelize.define("leaveComments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      leaveComment: {
        type: Sequelize.STRING,
        allowNull:true

      },
      fkRequestLeaveId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'requestLeaves', 
          key: 'id'
        }
      },
      createdAt: Sequelize.DATE, 
      updatedAt: Sequelize.DATE,
    });
  
    return LeaveComments;
  };