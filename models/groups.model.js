module.exports = (sequelize, Sequelize) => {
    const groups = sequelize.define("groups", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        groupNameStarred: {
            type: Sequelize.STRING,
            allowNull: false
        },
        groupNameUnstarred: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },

        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

 
    return groups;
};