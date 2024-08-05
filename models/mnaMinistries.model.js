module.exports = (sequelize, Sequelize) => {
    const MnaMinistries = sequelize.define("mnaMinistries", {
        mnaId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'mnas',
                key: 'id'
            }
        },
        ministryId: {
            type: Sequelize.INTEGER,
            references: {
                model: 'ministries',
                key: 'id'
            }
        },
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });

    return MnaMinistries;
};