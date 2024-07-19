module.exports = (sequelize, Sequelize) => {
    const noticeOfficeDairies = sequelize.define("noticeOfficeDairies", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        noticeOfficeDiaryNo: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        noticeOfficeDiaryDate: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        noticeOfficeDiaryTime: {
            type: Sequelize.STRING,
            allowNull: false
        },
        businessType: {
            type: Sequelize.ENUM("Resolution", "Motion", "Question"),
            allowNull: false,
        },
        businessId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    noticeOfficeDairies.associate = function (models) {
        noticeOfficeDairies.hasMany(models.motions, { foreignKey: 'fkDairyNumber' });
    };

    return noticeOfficeDairies;
};