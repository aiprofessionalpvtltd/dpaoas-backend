module.exports = (sequelize, Sequelize) => {
    const fileDiaries = sequelize.define("fileDiaries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        diaryType: {
            type: Sequelize.ENUM("Incoming", "Outgoing"),
            allowNull: false,
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
            allowNull: false,
        },

        diaryDate: {
            type: Sequelize.DATE,
            allowNull: false
        },

        diaryTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    fileDiaries.associate = function (models) {

        fileDiaries.belongsTo(models.freshReceipts, { foreignKey: 'fkFreshReceiptId', as: 'freshReceipts' });

    };
    return fileDiaries;

};