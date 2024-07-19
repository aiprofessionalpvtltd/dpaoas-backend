module.exports = (sequelize, Sequelize) => {
    const freshReceiptAttachemnts = sequelize.define("freshReceiptAttachemnts", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filename: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkFreshReceiptId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'freshReceipts',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return freshReceiptAttachemnts;

};