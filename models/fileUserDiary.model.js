module.exports = (sequelize, Sequelize) => {
    const fileUserDiaries = sequelize.define("fileUserDiaries", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        fkSubmittedByUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
        },

        diaryNumber: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    // fileRemarks.associate = function (models) {
    //     fileRemarks.belongsTo(models.users, { foreignKey: 'submittedBy', as: 'users' });
    //     fileRemarks.belongsTo(models.users, { foreignKey: 'assignedTo', as: 'users' });
    //     fileRemarks.belongsTo(models.newFiles, { foreignKey: 'fkFileId', as: 'file' });
    //     fileRemarks.belongsTo(models.cases, { foreignKey: 'fkCaseId', as: 'case' });


    // };
    return fileUserDiaries;

};