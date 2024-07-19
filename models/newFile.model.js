module.exports = (sequelize, Sequelize) => {
    const newFiles = sequelize.define("newFiles", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkFileRegisterId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'fileRegisters',
                key: 'id'
            }
        },

        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkMainHeadingId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'mainHeadingFiles',
                key: 'id'
            }
        },

        year: {
            type: Sequelize.STRING,
            allowNull: false
        },
        serialNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        fileNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fileSubject: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        dateOfRecording: {
            type: Sequelize.DATE,
            allowNull: true,
        },

        fileCategory: {
            type: Sequelize.ENUM("A", "B", "C", "D"),
            allowNull: true
        },
        fileClassification: {
            type: Sequelize.STRING,
            allowNull: true
        },

        fileType: {
            type: Sequelize.ENUM("Urgent", "Priority", "Immediate", "Routine","null"),
            defaultValue: "null",
            allowNull: true
        },
        fileMovement: {
            type: Sequelize.STRING,
            allowNull: true
        },


        fileStatus: {
            type: Sequelize.ENUM("fileIn", "fileOut"),
            defaultValue: "fileIn"

        },
        // submittedBy: {
        //     type: Sequelize.INTEGER,
        //     allowNull: true,
        //     references: {
        //         model: 'users',
        //         key: 'id'
        //     }
        // },
        // assignedTo: {
        //     type: Sequelize.INTEGER,
        //     allowNull: true,
        //     references: {
        //         model: 'users',
        //         key: 'id'
        //     }
        // },
        // fileStatus: {
        //     type: Sequelize.ENUM("Open", "Inprogess", "Approved", "Closed"),
        //     defaultValue: 'Open'
        // },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    newFiles.associate = function (models) {
        newFiles.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });
        newFiles.belongsTo(models.mainHeadingFiles, { foreignKey: 'fkMainHeadingId', as: 'mainHeading' });
        newFiles.belongsTo(models.fileRegisters, { foreignKey: 'fkFileRegisterId', as: 'fileRegister' })
        newFiles.hasMany(models.sectionsCases, { foreignKey: 'fkFileId', as: 'filesCases' })

    };
    return newFiles;

};