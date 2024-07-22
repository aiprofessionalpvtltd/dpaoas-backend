module.exports = (sequelize, Sequelize) => {
    const complaints = sequelize.define("complaints", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkComplaineeUserId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // String Field For User Name
        userName: {
            type: Sequelize.STRING,
            allowNull: true
        },

        fkAssignedResolverId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        fkComplaintTypeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },

        fkComplaintCategoryId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'complaintCategories',
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

        tonerQuantity: {
            type: Sequelize.INTEGER,
            allowNull: true
        },

        complaintDescription: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        // complaintAttachmentFromComplainee: {
        //     type: Sequelize.STRING,
        //     allowNull: true,
        // },

        complaintAttachmentFromResolver: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        complaintIssuedDate: {
            type: Sequelize.STRING,
            allowNull: true
        },

        complaintResolvedDate: {
            type: Sequelize.STRING,
            allowNull: true
        },

        complaintRemark: {
            type: Sequelize.STRING,
            allowNull: true
        },

        complaintStatus: {
            type: Sequelize.ENUM("pending", "in-progress", "resolved", "closed"),
            defaultValue: 'pending'
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    complaints.associate = function (models) {
        complaints.belongsTo(models.users, { foreignKey: 'fkComplaineeUserId' });
        complaints.belongsTo(models.users, { foreignKey: 'fkAssignedResolverId' })
        complaints.belongsTo(models.branches, { foreignKey: 'fkComplaintTypeId' });
        complaints.belongsTo(models.complaintCategories, { foreignKey: 'fkComplaintCategoryId' });
        complaints.belongsTo(models.tonerModels , { foreignKey: 'fkTonerModelId' })
    }


    return complaints;
};