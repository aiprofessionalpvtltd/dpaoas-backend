module.exports = (sequelize, Sequelize) => {
    const complaints = sequelize.define("complaints", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkComplaineeUserId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
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
            allowNull: false,
            references: {
                model: 'complaintTypes',
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

        complaintDescription: {
            type: Sequelize.STRING,
            allowNull: false,
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
            allowNull: false
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
            type: Sequelize.ENUM("pending", "in-progress", "resolved"),
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
        complaints.belongsTo(models.complaintTypes, { foreignKey: 'fkComplaintTypeId' });
        complaints.belongsTo(models.complaintCategories, { foreignKey: 'fkComplaintCategoryId' });
    }


    return complaints;
};