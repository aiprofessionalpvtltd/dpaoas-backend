module.exports = (sequelize, Sequelize) => {
    const ResearchServices = sequelize.define("researchServices", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        service_type: {
            type: Sequelize.ENUM("Statistical Data", "Brief", "General Information", "Talking Points", "Backgrounders", "Country Papers/Profiles", "Statistical Analyses", "Research Reports from Other Sources", "Basic Information"),
            allowNull: false,
        },
        details: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        isEditable: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },

        remarks: {
            type: Sequelize.TEXT,
            allowNull: true
        },

        attachment: {
            type: Sequelize.STRING,
            allowNull: true
        },
        isActive: {
            type: Sequelize.ENUM("active", "inactive", "Received", "Request In Process", "Delivered"),
            defaultValue: "Received",
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });


    ResearchServices.associate = function (models) {
        ResearchServices.belongsTo(models.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });
      };

    return ResearchServices;
};