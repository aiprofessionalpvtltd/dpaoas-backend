module.exports = (sequelize, Sequelize) => {
    const inventoryBills = sequelize.define("inventoryBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        invoiceNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        // vendorName: {
        //     type: Sequelize.ENUM("AI Professionals","Aivatek","Quest"),
        //     allowNull: false,
        // },

        fkVendorId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'vendors',
                key: 'id'
            }
        },

        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },

        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        invoiceAttachment: {
            type: Sequelize.STRING,
            allowNull: true,
        },


        invoiceDate: {
            type: Sequelize.STRING,
            allowNull: false
        },


        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    inventoryBills.associate = function (models) {
        inventoryBills.belongsTo(models.vendors, { as: 'vendor', foreignKey: 'fkVendorId' });

    };

    return inventoryBills;
};