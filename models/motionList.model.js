module.exports = (sequelize, Sequelize) => {
    const motionLists = sequelize.define("motionLists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        fkSessionId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'sessions',
                key: 'id'
            }
        },

        motionType: {
            type: Sequelize.ENUM("Adjournment Motion", "Call Attention Notice", "Privilege Motion", "Laying of Copy", "Motion For Consideration/Discussion", "Motion Under Rule 194", "Motion Under Rule 218", "Motion Under Rule 60"),
        },
        motionWeek: {
            type: Sequelize.ENUM("Not Applicable", "1st Week", "2nd Week", "3rd Week", "4th Week", "5th Week"),
            // defaultValue: 'pending'
        },

        listName: {
            type: Sequelize.STRING,
            allowNull: false
        },

        listDate: {
            type: Sequelize.STRING,
            allowNull: false
        },

        motionListStatus: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active"
        },
        
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,

    });

    motionLists.associate = function (models) {
        motionLists.belongsTo(models.sessions, { foreignKey: 'fkSessionId', as: 'sessionName' });
        motionLists.belongsToMany(models.motions, {
            through: 'motionMotionLists',
            foreignKey: 'fkMotionListId',
            otherKey: 'fkMotionId',
            as: 'motions'
          });

    };

    return motionLists;
};