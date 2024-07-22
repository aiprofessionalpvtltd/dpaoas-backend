const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const Employee = db.employees;
const RolesPermissions = db.rolesPermissions
const Branches = db.branches
const Modules = db.modules;
const Permissions = db.permissions
const UserSession = db.userSession;
const Departments = db.departments;
const Designations = db.designations;
const bcrypt = require('bcrypt');
const Op = db.Sequelize.Op;
const jwt = require('jsonwebtoken');
const userService = {
  // Create A New User
  createUser: async (req) => {

    try {
      // Check if the specified role exists
      const role = await Roles.findOne({ where: { id: req.roleId } });
      if (!role) {
        throw ({ message: 'Role Not Found!' })
      }
      // Check if the specified department exists
      const department = await Departments.findOne({ where: { id: req.departmentId } });
      if (!department) {
        throw ({ message: 'Deparment Not Found!' })
      }

      // Check if the specified department exists
      const designation = await Designations.findOne({ where: { id: req.designationId } });
      if (!designation) {
        throw ({ message: 'Designation Not Found!' })
      }

      // Hash the user's password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.password, salt);
      req.password = hashedPassword;

      // Create the user
      const user = await Users.create(req);
      return user;

    } catch (error) {

      throw { message: error.message || "Error Creating User!" }
    }
  },

  // Retrieve All Users
  findAllUsers: async () => {
    try {
      const users = await Users.findAll();
      return users;
    }
    catch (error) {
      throw { mmessage: error.message || "Error Fetching All Users!" }
    }
  },

  // Retrieve Single User
  findSingleUser: async (req) => {
    try {
      const userId = req.params.id;
      const user = await Users.findByPk(userId);
      if (!user) {
        throw { message: "User Not Found!" }
      }

      const fetchedUser = await Users.findByPk(userId);
      return fetchedUser;
    } catch (error) {
      throw { message: error.message || "Error Fetching User!" }
    }
  },

  // Generate Auth Token
  generateAuthToken: async (userId) => {
    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined in the environment");
        // Handle the error appropriately, for example, throw an error or return an error response.
      }
      const tokenLogin = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '2h' });
      return tokenLogin;
    } catch (err) {
      console.error(err);
      // Handle the error appropriately
    }
  },

  // Handle Login Attempts
  handleLoginAttempt: async function (user, isLoginSuccessful) {
    // Assuming user is an instance of your User model
    try {
      // Failed login attempt

      if (user.loginAttempts > 0) {
        user.loginAttempts--;
      }
      if (user.loginAttempts === 0) {
        // Lock the account if there are no more attempts
        user.userStatus = 'locked';
      }
      await user.save();
      return user.userStatus
    } catch (err) {
      console.log(err);
    }
  },
  // Login's A User
  loginUser: async (email, password, ipAddress) => {

    if (!email || !password) {
      throw ({ message: 'Please provide both email and password!' })
    }
    // Check if the user exists in the database
    const user = await Users.findOne({ where: { email: email } });

    // If user does not exist, throw an error
    if (!user) {
      throw ({ message: 'Invalid Email!' });
    }
    else {

      const employee = await Employee.findOne({
        where: { fkUserId: user.id },
        attributes: {
          exclude: ['updatedAt', 'createdAt'],
          include: [],
        },
      });



      // Getting Role Name For That User
      const role = await Roles.findOne({
        where: { id: user.fkRoleId },
        attributes: [
          'name'
        ],

      });

      // Getting Department Name For That User
      const department = await Departments.findOne({
        where: { id: employee.fkDepartmentId },
        attributes: [
          'id',
          'departmentName'
        ],
      })

      // Getting Designation Name For That User
      const designation = await Designations.findOne({
        where: { id: employee.fkDesignationId },
        attributes: [
          'id',
          'designationName'
        ],
      })

      const branch = await Branches.findOne({
        where: { id: employee.fkBranchId },
        attributes: [
          'id',
          'branchName'
        ],
      })

      // Getting Permission Name For That Role Attached to a User      
      const userPermissions = await RolesPermissions.findAll({
        where: { roleId: user.fkRoleId },
        include: [
          {
            model: Permissions,
            as: 'PermissionsRoles',
            attributes: ['name'],
            include: [
              {
                model: Modules,
                as: 'modules',
                attributes: ['name'],

              },
            ],
          },
        ],
      });

      // Now, aggregate the permissions by label
      const aggregatedPermissions = {};
      userPermissions.forEach(rolesPermission => {
        const permissionsRolesArray = rolesPermission.PermissionsRoles;
        const moduleName = permissionsRolesArray.dataValues.modules.name;
        const permissionName = permissionsRolesArray.dataValues.name;
        // Include all permissions for Super Admin
        if (role && role.name === "Super Admin") {
          if (!aggregatedPermissions[moduleName]) {
            aggregatedPermissions[moduleName] = [];
          }
          aggregatedPermissions[moduleName].push(permissionName);
        } else {
          // Exclude default permissions for other roles
          if (!["Roles", "Departments", "Designations", "Employee"].includes(moduleName)) {
            if (!aggregatedPermissions[moduleName]) {
              aggregatedPermissions[moduleName] = [];
            }
            aggregatedPermissions[moduleName].push(permissionName);
          }
        }
      });

      const formattedPermissions = Object.keys(aggregatedPermissions).map(label => ({
        label: label,
        hasAccess: aggregatedPermissions[label]
      }));

      // Response For Login
      const { ...employeeData } = employee.toJSON();
      const userWithRolePermission = {
        ...employeeData,
        email,
        role,
        department,
        designation,
        branch

      };

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // Successful login, reset attempts and update last attempt time
        // user.loginAttempts = 3;
        await user.save();
        // Generate and return the authentication token on successful login
        const token = await userService.generateAuthToken(user.id);
        await UserSession.createSession(user, ipAddress, token, true);
        return { token, user: userWithRolePermission, permissions: formattedPermissions };
      } else {
        // Handle login attempts and status updates for incorrect password
        const check = await userService.handleLoginAttempt(user, false);


        if (check === 'locked') {
          await UserSession.createSession(user, ipAddress, null, false);
          throw ({ message: "Your account has been locked!" })
        }
        else {
          await UserSession.createSession(user, ipAddress, null, false);

          throw ({ message: 'Invalid Password!' })
        }
      }
    }

  },

  // Update the User 
  editUser: async (req) => {
    try {
      const userId = req.params.id; // Extract userId from route parameters

      // Validate the user data
      if (!req.body.name || !req.body.roleId || !req.body.departmentId || !req.body.designationId) {
        throw ({ message: "Please provide name, roleId, departmentId and designationId in the request body!" })
        //throw new Error('Please provide name and roleId in the request body!');
      }

      // Check if the user exists
      const user = await Users.findByPk(userId);
      if (!user) {
        throw ({ message: "User Not Found!" })

      }

      // Check if the specified role exists
      const role = await Roles.findByPk(req.body.roleId);
      if (!role) {
        throw ({ message: "Role Not Found!" })
      }

      // Check if the specified department exists
      const department = await Departments.findOne({ where: { id: req.departmentId } });
      if (!department) {
        throw ({ message: 'Deparment Not Found!' })
      }

      // Check if the specified department exists
      const designation = await Designations.findOne({ where: { id: req.designationId } });
      if (!designation) {
        throw ({ message: 'Designation Not Found!' })
      }

      // Hash the user's password if provided
      let hashedPassword = null;
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(req.body.password, salt);
      }

      // Prepare the data to update
      const updatedUserData = req.body;
      if (hashedPassword) {
        updatedUserData.password = hashedPassword;
      }

      // Update the user
      await Users.update(updatedUserData, { where: { id: userId } });
      const updatedUser = await Users.findByPk(userId);

      return updatedUser;

    } catch (error) {
      throw { message: error.message || "Error Updating User!" }

    }
  },

  // Suspend/Delete the User
  deleteUser: async (req) => {
    try {
      const userId = req.params.id; // Extract userId from route parameters
      // Check if the user exists
      const user = await Users.findByPk(userId);
      if (!user) {
        throw ({ message: "User Not Found!" })
      }
      // Prepare the data to update
      const updatedUserData = {
        userStatus: 'inactive',
        loginAttempts: 0,
      };

      // Update the user
      await Users.update(updatedUserData, { where: { id: userId } });
      const updatedUser = await Users.findByPk(userId);

      return updatedUser;


    } catch (error) {
      throw { message: error.message || "Error Suspending User!" };
    }
  },

   //Delete the User
        suspendUser: async (req) => {
        try {
          const userId = req.params.id; // Extract userId from route parameters
          // Check if the user exists
          const user = await Users.findByPk(userId);
          if (!user) {
            throw({ message:"User Not Found!"})    
          }
           // Prepare the data to update
           const updatedUserData = {
            userStatus: 'inactive',
            loginAttempts: 0,
          };

           // Update the user
           await Users.update(updatedUserData, { where: { id: userId } });
           const updatedUser = await Users.findByPk(userId);
    
           return updatedUser;
           

        } catch (error) {
          throw { message: error.message || "Error Suspending User!" };
        }
      },

}


module.exports = userService;