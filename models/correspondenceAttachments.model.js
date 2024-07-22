module.exports = (sequelize, Sequelize) => {
    const correspondenceAttachments = sequelize.define("correspondenceAttachments", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fkCorrespondenceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            key: 'id',
            model: 'correspondences'
        }
      },
      file: {
        type: Sequelize.STRING,
        allowNull: true
      },
  
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
    
      return correspondenceAttachments;
      
    };