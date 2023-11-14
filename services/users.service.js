const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const RolesUsers = db.userRoles;
const UserSession = db.userSession;
const bcrypt = require('bcrypt');
const logger = require('../common/winston');
const userService = {
    // Create A New User
    createUser: async (req) => {
        // Validate the user data
        if (!req.name || !req.roleId) {
          throw({ message: 'Please provide name and roleId!' })
          
        }
        // Check if the specified role exists
        const role = await Roles.findOne({ where: { id: req.roleId } });
        if (!role) {
          throw({message:'Role Not Found!'})
        }
        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.password, salt);
        req.password = hashedPassword;
        // Create the user
        const user = await Users.create(req);
        // Create an entry in the users_roles table
        const usersRolesInput = {
          userId: user.id,
          roleId: role.id,
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
        throw({ message:"Error Fetching All Users!" })
      }
      },

      // Login's A User
      loginUser: async (email, password, ipAddress) =>{
        
          if (!email || !password) {
            throw({message:'Please provide both email and password!'})
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
              await UserSession.createSession(user, ipAddress, token, true);
              return { token  };
            } else {
              // Handle login attempts and status updates for incorrect password
              user.handleLoginAttempt(false);
        
              await UserSession.createSession(user, ipAddress, null, false);
              throw({ message: 'Invalid Password!' })
            }
          } else {
            // Handle login attempts and status updates for incorrect email
            throw({ message: 'Invalid Email!' })
            
          }
      
      }
}


module.exports = userService;