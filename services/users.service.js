const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const RolesUsers = db.userRoles;
const UserSession = db.userSession;
const bcrypt = require('bcrypt');
const logger = require('../common/winston');
const userService = {
    // Create A New User
    createUser: async (userData) => {
        // Validate the user data
        if (!userData.name || !userData.role_id) {
          throw new Error('Please provide a name and role ID.');
        }
      
        // Check if the specified role exists
        const role = await Roles.findOne({ where: { id: userData.role_id } });
        if (!role) {
          throw new Error('Role not found.');
        }
      
        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        userData.password = hashedPassword;
      
        // Create the user
        const user = await Users.create(userData);
      
        // Create an entry in the users_roles table
        const usersRolesInput = {
          user_id: user.id,
          role_id: role.id,
        };
      
        await RolesUsers.create(usersRolesInput);
      
        return user;
      },

      // Retrieve All Users
      findAllUsers: async () =>
      {
         try {
        const users = await Users.findAll();
        return users;
      } 
      catch (error) {
        throw new Error("Error occurred while retrieving users.");
      }
      },

      // Login's A User
      loginUser: async (email, password, ipAddress) =>{
        try {
          if (!email || !password) {
            logger.error('Login failed: Missing email or password');
            throw new Error('Please provide both email and password.');
          }
      
          // Check if the user exists in the database
          const user = await Users.findOne({ where: { email: email } });
      
          if (user) {
            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);
      
            if (isPasswordValid) {
              // Successful login, reset attempts and update last attempt time
              user.loginAttempts = 3;
              await user.save();
      
              // Generate and return the authentication token on successful login
              const token = await user.generateAuthToken();
              logger.info('User logged in successfully');
              await UserSession.createSession(user, ipAddress, token, true);
              return { status: 200, data: { token } };
            } else {
              // Handle login attempts and status updates for incorrect password
              user.handleLoginAttempt(false);
              logger.warn('Login failed: Password invalid');
              await UserSession.createSession(user, ipAddress, null, false);
              throw new Error('Password invalid');
            }
          } else {
            // Handle login attempts and status updates for incorrect email
            logger.warn('Login failed: Invalid Credentials');
            throw new Error('Invalid Credentials');
          }
        } catch (error) {
          logger.error('An error occurred during login', error);
          throw new Error('Internal server error');
          // Handle other errors as needed
        }
      }
}


module.exports = userService;