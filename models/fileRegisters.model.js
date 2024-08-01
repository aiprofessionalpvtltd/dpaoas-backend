module.exports = (sequelize, Sequelize) => {
    const fileRegisters = sequelize.define("fileRegisters", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkBranchId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        registerSubject: {
            type: Sequelize.STRING,
            allowNull: false
        },
        year: {
            type: Sequelize.STRING,
            allowNull: false
        },
        registerNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'), // ENUM type with 'active' or 'inactive'
            allowNull: false,
            defaultValue: 'active', // Default value set to 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    fileRegisters.associate = function (models) {
        fileRegisters.belongsTo(models.branches, { foreignKey: 'fkBranchId', as: 'branches' });
    };

    return fileRegisters;
};
