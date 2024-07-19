module.exports = (sequelize, Sequelize) => {
    const files = sequelize.define("files", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fileNumber: {
            type: Sequelize.STRING,
            allowNull: false,
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
        receivedOn: {
            type: Sequelize.DATE,
            allowNull: true
        },
        fileType: {
            type: Sequelize.ENUM("Internal", "External"),
            defaultValue: 'Internal'
        },
        fileCategory: {
            type: Sequelize.ENUM("A", "B","C","D"),
            defaultValue: 'A'
        },
        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        fkdepartmentId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'departments',
                key: 'id'
            }
        },
        fkMinistryId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },
        fileSubject: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        notingDescription: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        correspondingDescription: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        year: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        priority: {
            type: Sequelize.ENUM("Immediate", "Normal"),
            defaultValue: 'Normal'
        },
        attachment: {
            type: Sequelize.STRING,
            allowNull: true
        },
        fileStatus: {
            type: Sequelize.ENUM("Open", "Inprogess", "Approved", "Closed"),
            defaultValue: 'Open'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    files.associate = function (models) {
        files.belongsTo(models.ministries, { foreignKey: 'fkMinistryId', as: 'ministries' });
        files.belongsTo(models.departments, { foreignKey: 'fkdepartmentId', as: 'departments' });
        files.hasMany(models.fileRemarks, { as: 'fileRemarks', foreignKey: 'fkFileId' });
        files.hasMany(models.fileAttachments, { as: 'fileAttachments', foreignKey: 'fkFileId' });
        files.hasMany(models.filedairies, { as: 'filedairies', foreignKey: 'fkFileId' });
        files.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });
        files.belongsTo(models.employees, { foreignKey: 'submittedBy', as: 'employees' });
    };
    return files;

};