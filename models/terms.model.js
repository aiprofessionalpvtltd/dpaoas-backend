module.exports = (sequelize, Sequelize) => {
    const terms = sequelize.define("terms", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        termName: {
            type: Sequelize.STRING,
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
        fromDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        toDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active",
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    terms.associate = function(models) {
        terms.belongsTo(models.tenures, { foreignKey: 'fkTenureId'});
    };

    return terms;
};