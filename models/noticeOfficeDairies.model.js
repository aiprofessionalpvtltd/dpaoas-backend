module.exports = (sequelize, Sequelize) => {
    const noticeOfficeDairies = sequelize.define("noticeOfficeDairies", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        noticeOfficeDiaryNo: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        noticeOfficeDiaryDate: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        noticeOfficeDiaryTime: {
            type: Sequelize.STRING,
            allowNull: true
        },
        businessType: {
            type: Sequelize.ENUM("Resolution", "Motion", "Question"),
            allowNull: true,
        },
        businessId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    noticeOfficeDairies.associate = function (models) {
        noticeOfficeDairies.hasMany(models.motions, { foreignKey: 'fkDairyNumber' });
    };

    return noticeOfficeDairies;
};