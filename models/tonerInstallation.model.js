module.exports = (sequelize, Sequelize) => {
    const tonerInstallations = sequelize.define("tonerInstallations", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        requestDate: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        fkUserRequestId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // String Field For User Name
        userRequestName: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        fkBranchRequestId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkTonerModelId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tonerModels',
                key: 'id'
            }
        },

        quantity: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    tonerInstallations.associate = function (models) {
        tonerInstallations.belongsTo(models.tonerModels, { as: 'tonerModel', foreignKey: 'fkTonerModelId' });
        tonerInstallations.belongsTo(models.users, { as: 'requestUser', foreignKey: 'fkUserRequestId' });
        tonerInstallations.belongsTo(models.complaintTypes, { as: 'requestBranch', foreignKey: 'fkBranchRequestId' });

    };

    return tonerInstallations;
};