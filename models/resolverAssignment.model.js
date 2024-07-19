module.exports = (sequelize, Sequelize) => {
    const resolverAssignments = sequelize.define('resolverAssignments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      fkComplaintId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'complaints',
          key: 'id'
        }
      },
  
      fkAssignedById : {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },

      fkAssignedResolverId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      
      assignmentRemarks: {
        type: Sequelize.STRING,
        allowNull: true
      },
  
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
    resolverAssignments.associate = function(models) {
        resolverAssignments.belongsTo(models.users, { as: 'assignedBy' ,foreignKey: 'fkAssignedById' });
        resolverAssignments.belongsTo(models.users, { as: 'assignedTo' ,foreignKey: 'fkAssignedResolverId' });
        resolverAssignments.belongsTo(models.complaints, { foreignKey: 'fkComplaintId' });
  
  };
  
    return resolverAssignments;
  };
  