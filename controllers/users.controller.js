const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const RolesUsers = db.userRoles;
const UserSession = db.userSession;
const Op = db.Sequelize.Op;
const bcrypt = require('bcrypt');
const logger = require('../common/winston');

// Create and Save a new User
exports.create = async (req, res) => {
    // Validate request
    if (!req.body.name || !req.body.role_id) {
        res.status(400).send({
            message: "Please Enter Name and Role ID!"
        });
        return;
    }

    // Check if role_id exists in the roles table
    Roles.findOne({ where: { id: req.body.role_id } })
        .then(async role => {
            if (!role) {
                res.status(400).send({
                    message: "Role not found!"
                });
                return;
            }

            // Create a User
            let userInputData = req.body
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userInputData.password, salt);
            userInputData.password = hashedPassword;
            Users.create(userInputData)
                .then(user => {
                    // Now, create an entry in the users_roles table
                    let usersRolesInput = {
                        user_id: user.id,
                        role_id: role.id,
                        
                    };

                    RolesUsers.create(usersRolesInput)
                        .then(() => {
                            res.send(user); // Send the created user data
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Some error occurred while assigning the role to the User."
                            });
                        });
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Some error occurred while creating the User."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while checking the Roles."
            });
        });
};

exports.findAll = (req, res) => {
  Users.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving users."
      });
    });
};

// exports.login = async (req, res) => {
//     const { email, password } = req.body;
  
//     // Validate input (you can use a library like `validator` for this)
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Please provide both email and password.' });
//     }
  
//     try {
//       // Check if the user exists in the database
//       const user = await Users.findOne({ where: { email: email } });
  
//       if (user) {
//         // Compare the provided password with the hashed password in the database
//         const isPasswordValid = await bcrypt.compare(password, user.password);
  
//         if (isPasswordValid) {
//           // Reset login attempts and update the last attempt time on successful login
//           await user.handleLoginAttempt(true);

//           // Generate and return the authentication token
//           const token = await user.generateAuthToken();
//           res.status(200).json({ token });
//         } else {
//           return res.status(401).json({ error: 'Password invalid' });
//         }
//       } else {
//         return res.status(401).json({ error: 'Invalid Credentials' });
//       }
//     } catch (error) {
//       console.log(error);
//       // Handle other errors as needed
//     }
//   };
  
// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Please provide both email and password.' });
//   }

//   try {
//     // Check if the user exists in the database
//     const user = await Users.findOne({ where: { email: email } });

//     // If the user does not exist or if the user is already locked, return an invalid credentials error.
//     if (!user || user.status === 'locked') {
//       // It's important not to reveal that the email doesn't exist or the account is locked.
//       return res.status(401).json({ error: 'Invalid Credentials' });
//     }

//     // Compare the provided password with the hashed password in the database
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     // Call handleLoginAttempt regardless of password being correct or not
//     await user.handleLoginAttempt(isPasswordValid);

//     // If the password is incorrect, return an error
//     if (!isPasswordValid) {
//       // Check if the account is locked after the last attempt
//       if (user.status === 'locked') {
//         return res.status(403).json({ error: 'Account is locked.' });
//       }
//       return res.status(401).json({ error: 'Invalid Credentials' });
//     }

//     // Generate and return the authentication token on successful login
//     const token = await user.generateAuthToken();
//     return res.status(200).json({ token });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };



exports.login = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip

  // Validate input (you can use a library like `validator` for this)
  if (!email || !password) {
    logger.error('Login failed: Missing email or password');
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  try {
    // Check if the user exists in the database
    const user = await Users.findOne({ where: { email: email } });
    //console.log(user.dataValues)

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
        res.status(200).json({ token });
      } else {
        // Handle login attempts and status updates for incorrect password
        user.handleLoginAttempt(false);
        logger.warn('Login failed: Password invalid');
        await UserSession.createSession(user, ipAddress, null, false);
        return res.status(401).json({ error: 'Password invalid' });
      }
    } else {
      // Handle login attempts and status updates for incorrect email
      // or incorrect email and password
      logger.warn('Login failed: Invalid Credentials');
      // or incorrect email and password  
      return res.status(401).json({ error: 'Invalid Credentials' });
    }
  } catch (error) {
    console.log(error);
    logger.error('An error occurred during login', error);
    return res.status(500).json({ error: 'Internal server error' });
    // Handle other errors as needed
  }
};

