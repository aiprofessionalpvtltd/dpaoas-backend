module.exports = (sequelize, Sequelize) => {
    const seatingPlans = sequelize.define("seatingPlans", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkMemberId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'members',
                key: 'id'
            }
        },
        seatNumber: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        rowNumber: {
            type: Sequelize.STRING,
            allowNull: false
        },

        assignStatus: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    seatingPlans.associate = function (models) {
        seatingPlans.belongsTo(models.members, { foreignKey: 'fkMemberId' });

    };


    return seatingPlans;
};