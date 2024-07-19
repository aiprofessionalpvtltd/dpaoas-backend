// models/newRota.js
module.exports = (sequelize, DataTypes) => {
    const newRota = sequelize.define('newRota', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        fkSessionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        fkGroupId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'groups',
                key: 'id'
            }
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        allowedDates: {
            type: DataTypes.ARRAY(DataTypes.DATE),
            allowNull: true
        },
        weekDays: {
            type: DataTypes.ENUM("Tuesday-Friday", "Wednesday-Friday", "Alternate Days", "Regular Days"),
            allowNull: false,
        },
        startGroup: {
            type: DataTypes.STRING,
            allowNull: true
        },
        skipGroups: {
            type: DataTypes.JSONB, // This will store an array of { groupId, date }
            allowNull: true
        },
        pdfLink: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'newRota'
    });

    newRota.associate = function (models) {
        newRota.belongsTo(models.Session, { foreignKey: 'fkSessionId' });
        newRota.belongsTo(models.Group, { foreignKey: 'fkGroupId' });
    };

    return newRota;
};