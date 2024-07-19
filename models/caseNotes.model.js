module.exports = (sequelize, Sequelize) => {
    const caseNotes = sequelize.define("caseNotes", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                key: 'id',
                model: 'branches'
            }
        },

        fkFileId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                key: 'id',
                mode: 'newFiles'
            }
        },

        fkCaseId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                key: 'id',
                model: 'cases'
            }
        },

        fkFreshReciptIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true,
        },

        fkCorrespondenceIds: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            allowNull: true,
        },

        notingSubject: {
            type: Sequelize.STRING,
            allowNull: true
        },

        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return caseNotes;

};