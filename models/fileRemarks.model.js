module.exports = (sequelize, Sequelize) => {
    const fileRemarks = sequelize.define("fileRemarks", {
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
        CommentStatus: {
            //type: Sequelize.ENUM("Approved", "Discuss", "Retype/Amend","Rejected","Submit For Approval"),
            type: Sequelize.ENUM("Approved","Under Discussion","Retype/Amend","Rejected","Submit For Approval","Seen","Pend","NFA","Approval For Para"),
            allowNull: "false"
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    fileRemarks.associate = function (models) {
        fileRemarks.belongsTo(models.users, { foreignKey: 'submittedBy', as: 'submittedUser' });
        fileRemarks.belongsTo(models.users, { foreignKey: 'assignedTo', as: 'assignedUser' });
        fileRemarks.belongsTo(models.newFiles, { foreignKey: 'fkFileId', as: 'file' });
        fileRemarks.belongsTo(models.cases, { foreignKey: 'fkCaseId', as: 'case' });


    };
    return fileRemarks;

};