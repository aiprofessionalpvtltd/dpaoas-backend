module.exports = (sequelize, Sequelize) => {
    const userInventory = sequelize.define("userInventory", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkInventoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'inventories',
                key: 'id'
            }
        },

        fkAssignedToUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // String User Assigned Name
        userAssignedName: {
            type: Sequelize.STRING,
            allowNull: true
        },

        fkAssignedToBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        issuedDate: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        returnDate: {
            type: Sequelize.STRING,
            allowNull: true,
        },



        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    userInventory.associate = function (models) {
        userInventory.belongsTo(models.inventories, { as: 'assignedInventory', foreignKey: 'fkInventoryId' });
        userInventory.belongsTo(models.users, { as: 'assignedToUser', foreignKey: 'fkAssignedToUserId' });
        userInventory.belongsTo(models.complaintTypes, { as: 'assignedToBranch', foreignKey: 'fkAssignedToBranchId' });

    };

    return userInventory;
};