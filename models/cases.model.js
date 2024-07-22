module.exports = (sequelize, Sequelize) => {
    const cases = sequelize.define("cases", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fkFileId: {
        type: Sequelize.INTEGER,
            allowNull: false,
            references :{
                model: 'newFiles',
                key:'id'
            }
      },

      fkFreshReceiptId: {
        type: Sequelize.INTEGER,
            allowNull: true,
            references :{
                model: 'freshReceipts',
                key:'id'
            }
      },

      createdBy: {
        type: Sequelize.INTEGER,
            allowNull: false,
            references :{
                model: 'users',
                key:'id'
            }
      },
  
      isEditable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: 'active'
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  
  
      cases.associate = function (models) {
        cases.belongsTo(models.newFiles, { foreignKey: 'fkFileId', as: 'files' });
        cases.belongsTo(models.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' });
        cases.belongsTo(models.users , {foreignKey: 'createdBy', as: 'createdByUser' } )
      };
    
      return cases;
      
    };