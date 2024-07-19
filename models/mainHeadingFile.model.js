module.exports = (sequelize, Sequelize) => {
    const mainHeadingFile = sequelize.define("mainHeadingFile", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        mainHeading: {
            type: Sequelize.STRING,
            allowNull: false
        },

        mainHeadingNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },


        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    mainHeadingFile.associate = function (models) {
        mainHeadingFile.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });

    };
    return mainHeadingFile;

};