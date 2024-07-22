module.exports = (sequelize, Sequelize) => {
    const PublicUsers = sequelize.define("publicUsers", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        first_name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        last_name: {
            type: Sequelize.STRING,
            allowNull: true
        },
        cnic: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        designation: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        username: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        role: {
            type: Sequelize.STRING,
            defaultValue: 'public-user',
            allowNull: true,
        },
        profile_picture: {
            type: Sequelize.STRING(1000),
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: true,
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return PublicUsers;
};