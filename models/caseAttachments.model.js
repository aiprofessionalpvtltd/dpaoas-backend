module.exports = (sequelize, Sequelize) => {
    const caseAttachments = sequelize.define("caseAttachments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fileName: {
            type: Sequelize.STRING,
            allowNull: false,
        },

        fkSectionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references :{
                model: 'sectionsCases',
                key:'id'
            }
        },


        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    caseAttachments.associate = function (models) {
        caseAttachments.belongsTo(models.sectionsCases, { foreignKey: 'fkSectionId' , as: 'sectionCases' });
    };


    return caseAttachments;

};