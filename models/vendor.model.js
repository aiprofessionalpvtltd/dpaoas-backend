module.exports = (sequelize, Sequelize) => {
    const vendors = sequelize.define("vendors", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        vendorName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        description: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active",


        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    return vendors;
};