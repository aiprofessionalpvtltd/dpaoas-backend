module.exports = (sequelize, Sequelize) => {
    const divisions = sequelize.define("divisions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        divisionName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'ministries',
              key: 'id'
            }
        },
        divisionStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active",
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    divisions.associate = function(models) {
        divisions.belongsTo(models.ministries, { foreignKey: 'fkMinistryId'});
   
        // ... other associations ...
    };


    return divisions;
};