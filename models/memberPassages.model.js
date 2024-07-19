module.exports = (sequelize, Sequelize) => {
    const memberPassages = sequelize.define("memberPassages", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMemberPassageId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'introducedInSenateBills',
                key: 'id'
            }
        },
        fkSessionMemberPassageId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        memeberStatus: {
            type: Sequelize.ENUM("Passage", "Withdrawal"),
            allowNull: true,
        },
        memeberNoticeDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        dateOfConsiderationBill: {
            type: Sequelize.DATE,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    memberPassages.associate = function (models) {
        memberPassages.belongsTo(models.sessions, { foreignKey: 'fkSessionMemberPassageId', as: 'sessions' });
        memberPassages.belongsTo(models.introducedInSenateBills, { foreignKey: 'fkMemberPassageId', as: 'introducedInSenateBills' });
    };

    return memberPassages;
};