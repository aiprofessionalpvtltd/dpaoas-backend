module.exports = (sequelize, Sequelize) => {
    const LegislativeBills = sequelize.define("legislativeBills", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: Sequelize.STRING,
            allowNull: true
        },
        fkSessionNo: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        attachment: {
            type: Sequelize.ARRAY(Sequelize.STRING(1000)),
            allowNull: true,
        },
        date: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        fkBillStatus: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 1,
            references: {
                model: 'billStatuses',
                key: 'id'
            }
        },
        device: {
            type: Sequelize.STRING,
            defaultValue: 'web',
            allowNull: true,
        },
         
        legislativeSentStatus: {
            type: Sequelize.ENUM("inNotice", "toLegislation"),
            defaultValue: 'inNotice'
        },

        legislativeSentDate: {
            type: Sequelize.DATE,
            allowNull: true
        },
        
        isActive: {
            type: Sequelize.ENUM("active", "inactive"),
            defaultValue: 'active',
            allowNull: true,
        },
        web_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    LegislativeBills.associate = function (models) {
        LegislativeBills.belongsTo(models.sessions, { foreignKey: 'fkSessionNo', as: 'session' });
        LegislativeBills.belongsTo(models.billStatuses, { foreignKey: 'fkBillStatus', as: 'billStatuses' });
        LegislativeBills.belongsTo(models.members, { foreignKey: 'web_id', targetKey: 'id', as: 'member' });

    };



    return LegislativeBills;
};