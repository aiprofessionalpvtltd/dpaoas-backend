module.exports = (sequelize, Sequelize) => {
    const freshReceiptRemarks = sequelize.define("freshReceiptRemarks", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        submittedBy: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        assignedTo: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        comment: {
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

        CommentStatus: {
            // type: Sequelize.ENUM("Received", "Put Up", "Initiated", "Submit For Approval", "Retype/Amend"),
            type: Sequelize.ENUM("Put Up For","Please Link","For Perusal Please","Submitted For Approval"),
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    freshReceiptRemarks.associate = function (models) {
        freshReceiptRemarks.belongsTo(models.users, { foreignKey: 'submittedBy', as: 'submittedUser' });
        freshReceiptRemarks.belongsTo(models.users, { foreignKey: 'assignedTo', as: 'assignedUser' });
        freshReceiptRemarks.belongsTo(models.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipt' });


    };
    return freshReceiptRemarks;

};