module.exports = (sequelize, Sequelize) => {
    const fileSignatures = sequelize.define("fileSignatures", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        signature: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
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

        fkCaseId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'cases',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return fileSignatures;

};