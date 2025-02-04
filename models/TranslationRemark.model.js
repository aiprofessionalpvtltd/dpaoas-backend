module.exports = (sequelize, Sequelize) => {
    const translationRemarks = sequelize.define("translationRemarks", { // Changed table name
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category: {
            type: Sequelize.ENUM('Question', 'Motion', 'Resolution'),
            // defaultValue: 'Question',
            allowNull: false
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
        fkQuestionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'questions',
                key: 'id'
            }
        },
        fkMotionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'motions',
                key: 'id'
            }
        },
        fkResolutionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'resolutions',
                key: 'id'
            }
        },
        // fkIntroducedInSenateId: {
        //     type: Sequelize.INTEGER,
        //     allowNull: true,
        //     references: {
        //         model: 'introducedInSenateBills',
        //         key: 'id'
        //     }
        // },
        CommentStatus: {
            type: Sequelize.ENUM("Please Put Up", "Please Link", "For Perusal Please", "Submitted For Approval"),
            allowNull: true
        },
        priority: {
            type: Sequelize.ENUM('Confidential', 'Immediate', 'Routine'),
            defaultValue: 'Immediate',
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    translationRemarks.associate = function (models) {
        translationRemarks.belongsTo(models.users, { foreignKey: 'submittedBy', as: 'submittedUser' });
        translationRemarks.belongsTo(models.users, { foreignKey: 'assignedTo', as: 'assignedUser' });
        translationRemarks.belongsTo(models.questions, { foreignKey: 'fkQuestionId', as: 'question' });
        translationRemarks.belongsTo(models.motions, { foreignKey: 'fkMotionId', as: 'motion' });
        translationRemarks.belongsTo(models.resolutions, { foreignKey: 'fkResolutionId', as: 'resolution' });
        // translationRemarks.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkIntroducedInSenateId', as: 'introducedInSenateBills' });
    };

    return translationRemarks;
};


