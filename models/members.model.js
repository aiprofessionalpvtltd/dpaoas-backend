const db = require("../models");

module.exports = (sequelize, Sequelize) => {
    const members = sequelize.define("members", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        memberName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        memberUrduName: {
            type: Sequelize.STRING,
            allowNull: true
        },
        gender: {
            type: Sequelize.ENUM("Male", "Female"),
            allowNull: true
        },
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tenures',
                key: 'id'
            }
        },
        fkParliamentaryYearId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'parliamentaryYears',
                key: 'id'
            }
        },
        fkTermId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'terms',
                key: 'id'
            }
        },
        memberStatus: {
            type: Sequelize.ENUM("Active", "Active/Oath Not Administered", "Deceased", "Disqualified", "Resigned", "Retired", "Tenure Completed"),
            defaultValue: 'Active'
        },
        politicalParty: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'politicalParties',
                key: 'id'
            }
        },
        electionType: {
            type: Sequelize.ENUM("Bye Election", "Scheduled Election"),
            allowNull: true
        },

        governmentType: {
            type: Sequelize.ENUM("Opposition", "Government", "Independent", "Minister", "Treasury", "Anyside", "Joint Resolution"),
            allowNull: true
        },

        memberProvince: {
            type: Sequelize.ENUM("Balochistan", "Punjab","Khyber Pakhtunkhwa","Sindh","Erstwhile FATA", "Federal Capital Area Islamabad"),
            allowNull: true
        },
        religion: {
            type: Sequelize.ENUM("Islam", "Christianity","Hinduism","Sikh","Other"),
            allowNull: true
        },
        isMinister: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 'true'
        },
        phoneNo: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        reason: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 'true'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    members.associate = function (models) {
        members.belongsTo(models.tenures, { foreignKey: 'fkTenureId', as: 'tenures' });
        members.belongsTo(models.terms, { foreignKey: 'fkTermId', as: 'terms' });
        members.belongsTo(models.politicalParties, { foreignKey: 'politicalParty', as: 'politicalParties' });
        members.belongsToMany(models.resolutions, { through: 'resolutionMovers', foreignKey: 'fkResolutionId', otherKey: 'fkMemberId', as: 'resolutions' });
        members.hasMany(models.contactListUsers, { foreignKey: 'fkMemberId', as: 'member' });
    };
    return members;
};