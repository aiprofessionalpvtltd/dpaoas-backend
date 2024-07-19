module.exports = (sequelize, Sequelize) => {
    const sectionsCases = sequelize.define("sectionsCases", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkCaseId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references :{
                model: 'cases',
                key:'id'
            }
        },

        sectionType: {
            type: Sequelize.ENUM("Note","Correspondence","Sanction","Objection","Letter"),
            allowNull: false
        },

        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    sectionsCases.associate = function (models) {
        sectionsCases.belongsTo(models.cases, { foreignKey: 'fkCaseId', as: 'cases'})
        sectionsCases.hasMany(models.caseAttachments , { foreignKey: 'fkSectionId', as: 'caseAttachments'})
    };

    return sectionsCases;

};