const jwt = require('jsonwebtoken');

module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    phoneNo :{
      type: Sequelize.STRING,
      allowNull: false,
    },
    gender: {
      type: Sequelize.ENUM("male", "female"),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    userStatus: {
      type: Sequelize.ENUM("active", "inactive", "locked"),
      defaultValue: 'active',
      allowNull: false
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      defaultValue: 3, // Set the number of login attempts
    },
    fileNumber: {
      type: Sequelize.INTEGER,
      allowNull: false      
    },
    profileImage:{
      type: Sequelize.STRING,
      allowNull: true
    },

    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE,
  });

  // Define the method on the model prototype
  Users.prototype.generateAuthToken = async function () {
    try {
      const tokenLogin = jwt.sign({ _id: this.id }, process.env.JWT_SECRET, {expiresIn: '24h'});
      if(!this.tokens) {
        this.tokens = [];
      }
      //this.tokens = this.tokens.concat(tokenLogin);
      // Push a new object with the token to the array
      //this.tokens.push({ token: tokenLogin });
      //await this.save();
      return tokenLogin;
    } catch (err) {
      console.log(err);
    }
  };

  // Add a method to handle login attempts and status updates
  Users.prototype.handleLoginAttempt = async function () {
  
      // Failed login attempt
      if (this.loginAttempts > 0) {
        this.loginAttempts--;
        console.log(this.loginAttempts);
      }
  
      if (this.loginAttempts === 0) {
        // Lock the account if there are no more attempts
        this.status = 'locked';
      }
    
  
    await this.save();
  };

  return Users;
};
