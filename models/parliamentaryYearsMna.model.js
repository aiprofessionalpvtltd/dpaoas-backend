module.exports = (sequelize, Sequelize) => {
    const parliamentaryYearsMna = sequelize.define("parliamentaryYearsMna", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        parliamentaryTenure: {
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

        fkTermId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'terms',
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
        description: {
            type: Sequelize.STRING,
            allowNull: true
        },
        status: {
            type: Sequelize.ENUM("active","inactive"),
            defaultValue: "active",
        },
       
        createdAt: Sequelize.DATE,
        updatedAt: Sequelize.DATE,
    });
    
    parliamentaryYearsMna.associate = function(models) {
        // Define a belongsTo association with Tenures
        parliamentaryYearsMna.belongsTo(models.Tenures, {
            foreignKey: 'fkTenureId',
            as: 'tenure' // Optional: Alias for the association
        });
        parliamentaryYearsMna.belongsTo(models.Tenures, {
            foreignKey: 'fkMinisterTenureId',
            as: 'tenuresMinister' // Optional: Alias for the association
        });

        //Define an association with Terms if needed
        parliamentaryYearsMna.belongsTo(models.Terms, {
            foreignKey: 'fkTermId',
            as: 'term' // Optional: Alias for the association
        });
    };


    return parliamentaryYearsMna;
};