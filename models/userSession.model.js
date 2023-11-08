module.exports = (sequelize, Sequelize) => {
    const UserSession = sequelize.define("userSession", {
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'users', // This should match the name of the "users" table
              key: 'id'
            }
          },
          ipAddress: {
            type: Sequelize.STRING
          },
          loggedInAt: Sequelize.DATE,
          tokens: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM("Success", "Failed"),
            allowNull: false
          },
          updatedAt: Sequelize.DATE,
        });

        UserSession.createSession = async function (user, ipAddress, token, isSuccess) {
          console.log("HELLO")
          const sessionData = {
            userId: user.id,
            ipAddress: ipAddress,
          };
        
          if (isSuccess) {
            sessionData.status = 'Success';
            sessionData.tokens = token;
            sessionData.loggedInAt = new Date();
          
          } else {
            sessionData.status = 'Failed';
            // Don't set tokens for failed login
          }
        
          await this.create(sessionData);
        };
        
  
    return UserSession;
  };


