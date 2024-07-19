module.exports = (sequelize, Sequelize) => {
    const inventories = sequelize.define("inventories", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkInventoryBillId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'inventoryBills',
                key: 'id'
            }
        },

        serialNo: {
            type: Sequelize.STRING,
            allowNull: false
        },

        productName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        manufacturer: {
            type: Sequelize.STRING,
            allowNull: false
        },

        productCategories: {
            type: Sequelize.ENUM("Laptop", "Printer", "Mouse", "Keyboard"),
            allowNull: false
        },

        barCodeLable: {
            type: Sequelize.STRING,
            allowNull: true
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        purchasedDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        warrantyExpiredDate: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        status: {
            type: Sequelize.ENUM('in-stock/store', 'issued', 'disposed of', 'repairing', 'out of order'),
            defaultValue: 'in-stock/store',
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    inventories.associate = function (models) {
        inventories.belongsTo(models.inventoryBills, { as: 'invoiceNumber', foreignKey: 'fkInventoryBillId' });

    };
    return inventories;
}