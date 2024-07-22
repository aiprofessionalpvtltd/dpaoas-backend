module.exports = (sequelize, Sequelize) => {
    const eventCalenders = sequelize.define("eventCalenders", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        countryName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        houseType: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        electionType: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        eventDate: {
            type: Sequelize.DATE,
            allowNull: false
        },
        eventTime: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        file: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active'
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    

    return eventCalenders;
};