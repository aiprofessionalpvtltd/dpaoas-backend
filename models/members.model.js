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
            allowNull: false
        },
        memberUrduName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        gender: {
            type: Sequelize.ENUM("Male", "Female"),
            allowNull: false
        },
        fkTenureId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'tenures',
                key: 'id'
            }
        },
        memberStatus: {
            type: Sequelize.ENUM("Active", "Active/Oath Not Administered", "Deceased", "Disqualified", "Resigned", "Retired", "Tenure Completed"),
            defaultValue: 'Active'
        },
        politicalParty: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'politicalParties',
                key: 'id'
            }
        },
        electionType: {
            type: Sequelize.ENUM("Bye Election", "Scheduled Election"),
            allowNull: false
        },

        governmentType: {
            type: Sequelize.ENUM("Opposition", "Government"),
            allowNull: false
        },

        memberProvince: {
            type: Sequelize.ENUM("Balochistan", "Punjab","Khyber Pakhtunkhwa","Sindh","Erstwhile FATA", "Federal Capital Area Islamabad"),
            allowNull: true
        },
        isMinister: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: 'true'
        },
        phoneNo: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    members.associate = function (models) {
        members.belongsTo(models.tenures, { foreignKey: 'fkTenureId', as: 'tenures' });
        members.belongsTo(models.politicalParties, { foreignKey: 'politicalParty', as: 'politicalParties' });
        members.belongsToMany(models.resolutions, { through: 'resolutionMovers', foreignKey: 'fkResolutionId', otherKey: 'fkMemberId', as: 'resolutions' });
        members.hasMany(models.contactListUsers, { foreignKey: 'fkMemberId', as: 'member' });
    };
    return members;
};