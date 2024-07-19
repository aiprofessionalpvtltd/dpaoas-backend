// models/lawAct.model.js

module.exports = (sequelize, Sequelize) => {
    const lawAct = sequelize.define("lawAct", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category: {
            type: Sequelize.ENUM("court laws", "criminal laws", "civil laws", "constitutional laws", "administrative laws"),
            allowNull: false
        },
        subject: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        updatedDate: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        lawNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        volumeNumber: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        chapterSections: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        heading: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        clauses: {
            type: Sequelize.TEXT,
            allowNull: false,
        },
        citationNumbers: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: "active",
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return lawAct;
};