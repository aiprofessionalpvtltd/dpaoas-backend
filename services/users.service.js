const db = require("../models");
const Users = db.users;
const Roles = db.roles;
const RolesUsers = db.userRoles;
const RolesPermissions = db.rolesPermissions
const PermissionsModules = db.modulesPermissions
const Permissions = db.permissions
const Moodules = db.modules;
const UserSession = db.userSession;
const Departments = db.departments;
const Designations = db.designations;
const UsersDepartments = db.userDespartments;
const UsersDesignations = db.userDesignations;
const Sequelize = require("sequelize");
const bcrypt = require('bcrypt');
const logger = require('../common/winston');

const userService = {
    // Create A New User
    createUser: async (req) => {

      try {
        // Validate the user data
        if (!req.fullName || !req.roleId || !req.departmentId || !req.designationId)  {
          throw({ message: 'Please provide full name, roleID, departmentID and designationID!' })
          
        }

       
        
        // Check if the specified role exists
        const role = await Roles.findOne({ where: { id: req.roleId } });
        if (!role) {
          throw({message:'Role Not Found!'})
        }
         // Check if the specified department exists
        const department = await Departments.findOne({ where: { id: req.departmentId } });
        if (!department) {
          throw({message:'Deparment Not Found!'})
        }

        // Check if the specified department exists
        const designation = await Designations.findOne({ where: { id: req.designationId } });
        if (!designation) {
          throw({message:'Designation Not Found!'})
        }

        // Hash the user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.password, salt);
        req.password = hashedPassword;
        // Create the user
        const user = await Users.create(req);

        // Create an entry in the usersRoles table
        const usersRolesInput = {
          userId: user.id,
          roleId: role.id,
        };

        // Create an entry in the usersDepartments table
        const usersDepartmentsInput = {
          userId: user.id,
          departmentId: department.id,
        };

           // Create an entry in the usersDepartments table
           const usersDesignationsInput = {
            userId: user.id,
            designationId: designation.id,
          };
      

        await RolesUsers.create(usersRolesInput);
        await UsersDepartments.create(usersDepartmentsInput);
        await UsersDesignations.create(usersDesignationsInput);

      
        return user;
      } catch (error)
      {
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw({ message: 'Email Already Exists. Choose different email!' })
        }
        throw { message: error.message || "Error Creating User!"}
      }
      },

      // Retrieve All Users
      findAllUsers: async () =>
      {
         try {
        const users = await Users.findAll();
        return users;
      } 
      catch (error) {
        throw { mmessage: error.message || "Error Fetching All Users!" }
      }
      },

      // Retrieve Single User
      findSingleUser: async(req) =>
      {
        try {
        const userId = req.params.id;
        const user = await Users.findByPk(userId);
        if(!user)
        {
          throw { message: "User Not Found!"}
        }

        const fetchedUser = await Users.findByPk(userId);
        return fetchedUser;
      } catch (error)
      {
        throw { message: error.message || "Error Fetching User!"}
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
            // Getting Role Name For That User
            const userRoles = await RolesUsers.findAll({
              where: { userId: user.id }
            });
            const roleId = userRoles.map(userRole => userRole.roleId);   
            console.log(roleId)
            const roles = await Roles.findAll({
              where: { id: roleId }
            });
             // Check if there's only one role or multiple
           const userRole = roles.length === 1 ? roles[0] : roles;


            // Getting Permission Name For That Role Attached to a User
            const rolesPermissions = await RolesPermissions.findAll({
              where: { roleId: roleId}
            })
           
            const permissionId = rolesPermissions.map(rolePermission => rolePermission.permissionId);     
            const permissions = await Permissions.findAll({
              where: {id: permissionId}
            });
            // Check if there's only one permission or multiple
            const rolePermission = permissions.length === 1 ? permissions[0] : permissions;


            // Getting Module Name for Permissions Attached to a Permission
            const permissionModules= await PermissionsModules.findAll({
              where: {id: permissionId}
            });
            const moduleId = permissionModules.map(modulePermission => modulePermission.moduleId);
            const modules = await Moodules.findAll({
              where: {id: permissionId}
            })

              // Check if there's only one module or multiple
            const modulePermission = modules.length === 1 ? modules[0] : modules;

             // Getting Department Name For That Department Attached to a User
             const usersDepartments = await UsersDepartments.findAll({
              where: { departmentId: user.id}
              })
          
            const departmentId = usersDepartments.map(userDepartment => userDepartment.departmentId);
            const departments = await Departments.findAll({
              where: {id: departmentId}
            });
            // Check if there's only one department or multiple
            const userDepartment = departments.length === 1 ? departments[0] : departments;


             // Getting Designation Name For That Designation Attached to a User
             const usersDesignations = await UsersDesignations.findAll({
              where: { designationId: user.id}
              })
          
            const designationId = usersDesignations.map(userDesignation => userDesignation.designationId);
            const designations = await Designations.findAll({
              where: {id: designationId}
            });
            // Check if there's only one designation or multiple
            const userDesignation = designations.length === 1 ? designations[0] : designations;
           

            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);
      
            if (isPasswordValid) {
              // Successful login, reset attempts and update last attempt time
              user.loginAttempts = 3;
              await user.save();
              // Generate and return the authentication token on successful login
              const token = await user.generateAuthToken();
              await UserSession.createSession(user, ipAddress, token, true);
              return { token, user , role : userRole, module : modulePermission, department: userDepartment, designation: userDesignation };
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
      
      },

      // Update the User 
        editUser: async (req) => {
        try {
          const userId = req.params.id; // Extract userId from route parameters
    
          // Validate the user data
          if (!req.body.name || !req.body.roleId || !req.body.departmentId || !req.body.designationId) {
            throw({ message: "Please provide name, roleId, departmentId and designationId in the request body!"})
            //throw new Error('Please provide name and roleId in the request body!');
          }
      
          // Check if the user exists
          const user = await Users.findByPk(userId);
          if (!user) {
            throw({ message:"User Not Found!"})
         
          }
      
          // Check if the specified role exists
          const role = await Roles.findByPk(req.body.roleId);
          if (!role) {
            throw({ message:"Role Not Found!"})
          }

          // Check if the specified department exists
        const department = await Departments.findOne({ where: { id: req.departmentId } });
        if (!department) {
          throw({message:'Deparment Not Found!'})
        }

        // Check if the specified department exists
        const designation = await Designations.findOne({ where: { id: req.designationId } });
        if (!designation) {
          throw({message:'Designation Not Found!'})
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
          
          // Check if the user's role has changed
          const userRole = await RolesUsers.findOne({ where: { userId } });
          if (userRole && userRole.roleId !== req.body.roleId) {
            // Update the user's role in the RolesUsers table
            await RolesUsers.update({ roleId: req.body.roleId }, { where: { userId } });
          }
          
           // Check if the user's department has changed
          const userDepartment = await UsersDepartments.findOne({ where: { userId } });
          if (userDepartment && userDepartment.departmentId !== req.body.departmentId) {
            // Update the user's department in the UsersDepartment table
            await UsersDepartments.update({ departmentId: req.body.departmentId }, { where: { userId } });
          }

          // Check if the user's designation has changed
          const userDesignation = await UsersDesignations.findOne({ where: { userId } });
          if (userDesignation && userDesignation.designationId !== req.body.designationId) {
              // Update the user's designation in the UsersDepartment table
              await UsersDesignations.update({ designationId: req.body.designationId }, { where: { userId } });
          }

          return updatedUser;

        } catch (error) {
          throw { message: error.message ||  "Error Updating User!"} 
         
        }
      },

      // Suspend/Delete the User
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