module.exports = (sequelize, Sequelize) => {
    const fileDiaries = sequelize.define("fileDiaries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        diaryType: {
            type: Sequelize.ENUM("Incoming", "Outgoing", "null"),
            allowNull: true,
        },

        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkFileId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'newFiles',
                key: 'id'
            }
        },


        fkFreshReceiptId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'freshReceipts',
                key: 'id'
            }
        },


        fileNumber: {
            type: Sequelize.STRING,
            allowNull: true
        },

        diaryNumber: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        diaryDate: {
            type: Sequelize.DATE,
            allowNull: true
        },

        diaryTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    fileDiaries.associate = function (models) {

        fileDiaries.belongsTo(models.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' });
        fileDiaries.belongsTo(models.branches, { foreignKey: 'fkBranchId' , as: 'branches'})
    };
    return fileDiaries;

};