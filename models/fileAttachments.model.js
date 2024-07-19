module.exports = (sequelize, Sequelize) => {
    const fileAttachments = sequelize.define("fileAttachments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        filename: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkFileId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'files',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    // fileRemarks.associate = function (models) {
    //     files.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
    //     files.belongsTo(models.departments, { foreignKey: 'fkdepartmentId', as: 'departments' });
    //     files.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });
    //     files.belongsTo(models.employees, { foreignKey: 'submittedBy', as: 'employees' });
    // };
    return fileAttachments;

};