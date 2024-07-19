module.exports = (sequelize, Sequelize) => {
    const resolutions = sequelize.define("resolutions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkSessionNo: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        fkResolutionDairyId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'resolutionDiaries',
                key: 'id'
            }
        },

        fkNoticeOfficeDairyId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'noticeOfficeDairies',
                key: 'id'
            }

        },

        colourResNo: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        resolutionType: {
            type: Sequelize.ENUM("Government Resolution", "Private Member Resolution", "Govt. Resolution Supported by others"),
            allowNull: true,
        },

        fkResolutionStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'resolutionStatuses',
                key: 'id'
            }
        },

        attachment: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },

        englishText: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        urduText: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        dateOfMovingHouse: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        dateOfDiscussion: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        dateOfPassing: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        sentForTranslation: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        isTranslated: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        },

        resolutionActive: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: true,
        },

        device: {
            type: Sequelize.STRING,
            defaultValue: 'web',
            allowNull: true,
        },

        createdByUser: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        deletedByUser: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        initiatedByBranch: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        sentToBranch: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        resolutionSentStatus: {
            type: Sequelize.ENUM("inResolution","toResolution", "inNotice"),
            defaultValue: "inNotice",
        },

        memberPosition: {
            type: Sequelize.ENUM("Treasury", "Opposition", "Independent", "Anyside"),
            allowNull: true,
        },

        resolutionSentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    resolutions.associate = function (models) {
        resolutions.belongsTo(models.sessions, { foreignKey: 'fkSessionNo', as: 'session' });
        resolutions.belongsTo(models.noticeOfficeDairies, { foreignKey: 'fkNoticeOfficeDairyId', as: 'noticeDiary' });
        resolutions.belongsTo(models.resolutionStatuses, { foreignKey: 'fkResolutionStatus', as: 'resolutionStatus' });
        resolutions.belongsTo(models.resolutionDiaries, { foreignKey: 'fkResolutionDairyId', as: 'resolutionDiaries' });
        resolutions.hasMany(models.resolutionMovers, { foreignKey: 'fkResolutionId', as: 'resolutionMovers' });
        resolutions.belongsTo(models.users, { foreignKey: 'createdByUser' })
        resolutions.belongsTo(models.users, { foreignKey: 'deletedByUser' })
        resolutions.belongsTo(models.branches, { foreignKey: 'initiatedByBranch' })
        resolutions.belongsTo(models.branches, { foreignKey: 'sentToBranch' })
    };

    return resolutions;
};